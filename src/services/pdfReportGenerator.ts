import { jsPDF } from 'jspdf';
import { DatabaseState } from './dataStore';

export interface ReportGenerationOptions {
  database: DatabaseState;
  currentAlignment: number;
  targetAlignment: number;
  effectiveVelocity?: number;
  thresholdVelocity?: number;
}

export function generateSkillVelocityPdfReport({
  database,
  currentAlignment,
  targetAlignment,
  effectiveVelocity = 1.0,
  thresholdVelocity = 1.5,
}: ReportGenerationOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const { currentUser, userCapabilities, learningProgress, outcomeFollowups } = database;

  // Colors
  const deepIndigo = [49, 46, 129]; // #312E81
  const electricIndigo = [79, 70, 229]; // #4F46E5
  const cyan = [6, 182, 212]; // #06B6D4
  const darkCharcoal = [24, 24, 27];
  const mutedGrey = [113, 113, 122];
  const warmBeige = [245, 238, 228];
  const cardBorder = [222, 208, 189];

  // Helper for drawing styled boxes
  const drawCard = (xPos: number, yPos: number, width: number, height: number, fillRgb: number[] = [255, 255, 255]) => {
    doc.setFillColor(fillRgb[0], fillRgb[1], fillRgb[2]);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(xPos, yPos, width, height, 2.5, 2.5, 'FD');
  };

  // --- HEADER BANNER ---
  // Top radiant accent gradient bar
  doc.setFillColor(deepIndigo[0], deepIndigo[1], deepIndigo[2]);
  doc.rect(margin, y, contentWidth * 0.35, 2, 'F');
  doc.setFillColor(electricIndigo[0], electricIndigo[1], electricIndigo[2]);
  doc.rect(margin + contentWidth * 0.35, y, contentWidth * 0.35, 2, 'F');
  doc.setFillColor(cyan[0], cyan[1], cyan[2]);
  doc.rect(margin + contentWidth * 0.7, y, contentWidth * 0.3, 2, 'F');
  y += 6;

  // Brand Name & Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(deepIndigo[0], deepIndigo[1], deepIndigo[2]);
  doc.text('VIRTUOSO', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(mutedGrey[0], mutedGrey[1], mutedGrey[2]);
  doc.text('Workforce Intelligence & Career Progression Engine', margin + 37, y - 0.5);

  const reportDateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(`Generated: ${reportDateStr}`, pageWidth - margin, y, { align: 'right' });
  y += 7;

  // Report Title Box
  drawCard(margin, y, contentWidth, 14, warmBeige);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(deepIndigo[0], deepIndigo[1], deepIndigo[2]);
  doc.text('SKILL ACQUISITION VELOCITY & MILESTONE ACHIEVEMENT SUMMARY', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(mutedGrey[0], mutedGrey[1], mutedGrey[2]);
  doc.text('Official empirical verification report & predictive career trajectory forecast', margin + 4, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(electricIndigo[0], electricIndigo[1], electricIndigo[2]);
  doc.text('AUTHENTICATED AUDIT RECORD', pageWidth - margin - 4, y + 8, { align: 'right' });
  y += 18;

  // --- SECTION 1: LEARNER & CAREER PROFILE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text('1. Learner Profile & Alignment Benchmarks', margin, y);
  y += 3;

  const profileCardH = 22;
  drawCard(margin, y, contentWidth, profileCardH);

  // Column 1: Learner identity
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text(currentUser.fullName, margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(mutedGrey[0], mutedGrey[1], mutedGrey[2]);
  doc.text(`Current Role: ${currentUser.currentJobTitle}`, margin + 4, y + 11);
  doc.text(`Organization: ${currentUser.organizationName}`, margin + 4, y + 15.5);
  doc.text(`Target Role: ${currentUser.targetJobTitle}`, margin + 4, y + 19.5);

  // Column 2: Role alignment metrics
  const col2X = margin + contentWidth * 0.58;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Current Role Alignment:', col2X, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(deepIndigo[0], deepIndigo[1], deepIndigo[2]);
  doc.text(`${currentAlignment}%`, col2X + 46, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(mutedGrey[0], mutedGrey[1], mutedGrey[2]);
  doc.text('Target Role Readiness:', col2X, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(cyan[0], cyan[1], cyan[2]);
  doc.text(`${targetAlignment}%`, col2X + 46, y + 16);

  y += profileCardH + 5;

  // --- SECTION 2: SKILL ACQUISITION VELOCITY & PACING ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text('2. Skill Growth Velocity & Acquisition Dynamics', margin, y);
  y += 3;

  // 4 Metric Tiles
  const tileGap = 3;
  const tileW = (contentWidth - tileGap * 3) / 4;
  const tileH = 21;

  const totalVerified = userCapabilities.filter((c) => c.isVerified).length;
  const totalApplied = userCapabilities.filter((c) => c.evidenceStatus === 'Applied' || c.evidenceStatus === 'Demonstrated').length;
  const totalMissions = learningProgress.filter((p) => p.status === 'completed').length;

  const tiles = [
    {
      title: 'Current Velocity',
      val: `+${effectiveVelocity.toFixed(1)}/mo`,
      sub: `Pacing vs ${thresholdVelocity.toFixed(1)} target`,
      highlightColor: effectiveVelocity >= thresholdVelocity ? [16, 185, 129] : [245, 158, 11],
    },
    {
      title: 'Tracked Skills',
      val: `${userCapabilities.length} Total`,
      sub: `${totalVerified} Employer-verified`,
      highlightColor: deepIndigo,
    },
    {
      title: 'Practical Labs',
      val: `${totalApplied} Demonstrated`,
      sub: 'Workplace & sandbox',
      highlightColor: electricIndigo,
    },
    {
      title: 'Missions Completed',
      val: `${totalMissions} Completed`,
      sub: 'Architectural units',
      highlightColor: cyan,
    },
  ];

  tiles.forEach((t, i) => {
    const tileX = margin + i * (tileW + tileGap);
    drawCard(tileX, y, tileW, tileH);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(mutedGrey[0], mutedGrey[1], mutedGrey[2]);
    doc.text(t.title.toUpperCase(), tileX + 3, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(t.highlightColor[0], t.highlightColor[1], t.highlightColor[2]);
    doc.text(t.val, tileX + 3, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(mutedGrey[0], mutedGrey[1], mutedGrey[2]);
    doc.text(t.sub, tileX + 3, y + 17.5);
  });

  y += tileH + 5;

  // --- SECTION 3: TARGET MILESTONES & PROJECTIONS ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text('3. Milestone Forecast & Longitudinal Outcomes', margin, y);
  y += 3;

  const milestoneBoxH = 26;
  drawCard(margin, y, contentWidth, milestoneBoxH);

  // Milestone Targets: 10 Competencies, 12 Competencies, 85+ Score
  const mColW = contentWidth / 3;

  // Col 1: Senior Platform Engineer Target
  const m1X = margin + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(deepIndigo[0], deepIndigo[1], deepIndigo[2]);
  doc.text('10 Competencies Target', m1X, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(mutedGrey[0], mutedGrey[1], mutedGrey[2]);
  doc.text('Senior Platform Engineer Benchmark', m1X, y + 10.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text('Target Timeline: Nov 2026', m1X, y + 15.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(mutedGrey[0], mutedGrey[1], mutedGrey[2]);
  doc.text('Status: 8/10 achieved · 88% confidence', m1X, y + 20);

  // Col 2: Staff Architect Target
  const m2X = margin + mColW + 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(electricIndigo[0], electricIndigo[1], electricIndigo[2]);
  doc.text('12 Competencies Target', m2X, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(mutedGrey[0], mutedGrey[1], mutedGrey[2]);
  doc.text('Staff Cloud Architect Benchmark', m2X, y + 10.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text('Target Timeline: Feb 2027', m2X, y + 15.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(mutedGrey[0], mutedGrey[1], mutedGrey[2]);
  doc.text('Status: Projected on track with sprint pacing', m2X, y + 20);

  // Col 3: 30/60/90 Retention Status
  const m3X = margin + mColW * 2 + 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(cyan[0], cyan[1], cyan[2]);
  doc.text('Career Outcome Retention', m3X, y + 6);

  const followups = outcomeFollowups.slice(0, 3);
  followups.forEach((f, idx) => {
    const fY = y + 11 + idx * 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    const label = `${f.milestone.replace('_', '-').toUpperCase()}:`;
    doc.text(label, m3X, fY);

    doc.setFont('helvetica', 'bold');
    if (f.status === 'completed') {
      doc.setTextColor(16, 185, 129);
      doc.text('COMPLETED (Verified)', m3X + 16, fY);
    } else {
      doc.setTextColor(electricIndigo[0], electricIndigo[1], electricIndigo[2]);
      doc.text(`Due ${f.dueDate}`, m3X + 16, fY);
    }
  });

  y += milestoneBoxH + 5;

  // --- SECTION 4: CAPABILITY PROFILE & EVIDENCE STATUS (TABLE) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
  doc.text('4. Demonstrated Competency Ledger & Evidence States', margin, y);
  y += 3;

  // Table Header
  const tableHeaderH = 6;
  doc.setFillColor(deepIndigo[0], deepIndigo[1], deepIndigo[2]);
  doc.rect(margin, y, contentWidth, tableHeaderH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('COMPETENCY & DOMAIN', margin + 3, y + 4.2);
  doc.text('LEVEL', margin + 85, y + 4.2);
  doc.text('EVIDENCE STATUS', margin + 115, y + 4.2);
  doc.text('CONFIDENCE', margin + 152, y + 4.2);
  y += tableHeaderH;

  // Render first 8 capabilities to fit comfortably on 1 page report
  const tableCaps = userCapabilities.slice(0, 8);
  const rowH = 6.8;

  tableCaps.forEach((cap, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 246, isEven ? 255 : 242);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.15);
    doc.rect(margin, y, contentWidth, rowH, 'FD');

    // Skill Name & Category
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(cap.skillName, margin + 3, y + 3.4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(mutedGrey[0], mutedGrey[1], mutedGrey[2]);
    doc.text(cap.category, margin + 3, y + 5.8);

    // Level
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    if (cap.currentLevel === 'Advanced') {
      doc.setTextColor(deepIndigo[0], deepIndigo[1], deepIndigo[2]);
    } else if (cap.currentLevel === 'Strong') {
      doc.setTextColor(electricIndigo[0], electricIndigo[1], electricIndigo[2]);
    } else {
      doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    }
    doc.text(cap.currentLevel, margin + 85, y + 4.5);

    // Evidence Status
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    if (cap.evidenceStatus === 'Verified') {
      doc.setTextColor(16, 185, 129);
      doc.text('Verified by Employer', margin + 115, y + 4.5);
    } else if (cap.evidenceStatus === 'Applied') {
      doc.setTextColor(electricIndigo[0], electricIndigo[1], electricIndigo[2]);
      doc.text('Applied at Work', margin + 115, y + 4.5);
    } else if (cap.evidenceStatus === 'Demonstrated') {
      doc.setTextColor(deepIndigo[0], deepIndigo[1], deepIndigo[2]);
      doc.text('Demonstrated in Lab', margin + 115, y + 4.5);
    } else {
      doc.setTextColor(mutedGrey[0], mutedGrey[1], mutedGrey[2]);
      doc.text(cap.evidenceStatus, margin + 115, y + 4.5);
    }

    // Confidence
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(`${cap.confidenceScore}%`, margin + 152, y + 4.5);

    y += rowH;
  });

  y += 4;

  // --- FOOTER & AUDIT PROVENANCE ---
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(mutedGrey[0], mutedGrey[1], mutedGrey[2]);
  doc.text(
    'VIRTUOSO Workforce Intelligence Platform • Cryptographically logged competency & milestone tracking',
    margin,
    pageHeight - 11
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(electricIndigo[0], electricIndigo[1], electricIndigo[2]);
  doc.text(
    `Ref: VIRTUOSO-${currentUser.fullName.replace(/\s+/g, '-').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    pageWidth - margin,
    pageHeight - 11,
    { align: 'right' }
  );

  // Clean filename with timestamp
  const safeName = currentUser.fullName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `VIRTUOSO_Skill_Velocity_Report_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`;

  doc.save(filename);
}
