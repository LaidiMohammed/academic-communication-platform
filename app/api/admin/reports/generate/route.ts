import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const { allowed } = rateLimit(ip, 30, 60000);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer '))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.slice(7));
  if (authErr || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify user is admin
  const { data: admin } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (admin?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { tier, modules = [] } = await req.json();

  if (!tier || !modules || modules.length === 0) {
    return NextResponse.json({ error: 'Missing tier or modules' }, { status: 400 });
  }

  try {
    // Fetch students for the given tier
    const { data: students, error: studentErr } = await supabase
      .from('students')
      .select('id, name, date_of_birth, status, remaining_sessions')
      .eq('academic_level', tier);

    if (studentErr) {
      console.error('Student fetch error:', studentErr);
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
    }

    if (!students || students.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No students found for the selected tier',
        reportId: `REPORT_${Date.now()}`,
        studentCount: 0,
        downloadUrl: '',
      });
    }

    // Calculate ages and format student data
    const reportData = students.map(student => {
      const dob = student.date_of_birth ? new Date(student.date_of_birth) : null;
      const age = dob
        ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 0;

      return {
        name: student.name || 'N/A',
        age: age || 'N/A',
        status: student.status || 'unknown',
        remainingByModule: modules.map((m: string) => ({
          module: m,
          sessions: (student.remaining_sessions?.[m] || 0) as number,
        })),
      };
    });

    // Create report metadata
    const reportId = `REPORT_${Date.now()}`;
    const generatedAt = new Date().toISOString();

    // Store report metadata (optional - for audit trail)
    try {
      await supabase
        .from('reports')
        .insert({
          id: reportId,
          admin_id: user.id,
          tier,
          modules: modules,
          student_count: reportData.length,
          generated_at: generatedAt,
          status: 'completed',
        });
    } catch {
      // Silently fail if table doesn't exist
    }

    // In production, you would generate the actual PDF here using jsPDF
    // For now, we'll return a simple success with data that can be used client-side to generate PDF
    // Or store the PDF in Blob storage and return the download URL

    return NextResponse.json({
      success: true,
      message: 'Report generated successfully',
      reportId,
      studentCount: reportData.length,
      reportData, // Pass data to client for PDF generation
      downloadUrl: '', // Would be populated if PDF was stored
      generatedAt,
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
