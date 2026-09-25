import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "./formatters";

/**
 * Función auxiliar para dibujar el encabezado corporativo estándar de TuFinanzas.
 * Retorna la posición vertical final (finalY) tras renderizar el header.
 */
const renderHeader = (doc, title, subtitle = "") => {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Barra superior decorativa primaria
  doc.setFillColor(37, 99, 235); // #2563eb
  doc.rect(0, 0, pageWidth, 5, "F");

  // Título de la empresa
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text("TuFinanzas", 14, 18);

  // Subtítulo de marca
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text("Sistema de Gestión de Finanzas Personales", 14, 23);

  // Fecha y hora de generación a la derecha
  const fechaGeneracion = new Date().toLocaleString("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  doc.setFontSize(8);
  doc.text(`Generado: ${fechaGeneracion}`, pageWidth - 14, 18, { align: "right" });
  doc.text("Moneda: Pesos Dominicanos (RD$)", pageWidth - 14, 23, { align: "right" });

  // Línea divisoria sutil
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.line(14, 26, pageWidth - 14, 26);

  // Título del reporte específico
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(title, 14, 34);

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 14, 39);
    return 44;
  }

  return 38;
};

/**
 * Función auxiliar para dibujar pie de página con número de páginas.
 */
const renderFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Línea de pie
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text("TuFinanzas - Documento Oficial Confidencial", 14, pageHeight - 7);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 7, { align: "right" });
  }
};

/**
 * 1. Exportar Reporte de Cortes Consolidados a PDF
 */
export const exportReporteCortesPDF = (reporte, anio) => {
  if (!reporte) return;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const startY = renderHeader(
    doc,
    `Reporte de Cortes Consolidados - Año ${anio}`,
    "Resumen de cierres mensuales, balances acumulados y verificación de límites"
  );

  const resumen = reporte.resumen || reporte.totales_consolidados || {};
  const pageWidth = doc.internal.pageSize.getWidth();
  const cardWidth = (pageWidth - 28 - 9) / 4;
  const cardY = startY;
  const cardHeight = 16;

  // Tarjetas KPI de resumen
  const kpis = [
    { label: "Total Cortes", val: String(resumen.total_cortes ?? resumen.total_periodos_cerrados ?? 0), color: [30, 41, 59] },
    { label: "Ingresos Anuales", val: formatCurrency(resumen.total_ingresos), color: [22, 101, 52] },
    { label: "Egresos Anuales", val: formatCurrency(resumen.total_egresos), color: [185, 28, 28] },
    { label: "Cortes Excedidos", val: String(resumen.cortes_superaron_limite ?? resumen.meses_supero_limite ?? 0), color: [180, 83, 9] },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (cardWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + cardWidth / 2, cardY + 5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...kpi.color);
    doc.text(kpi.val, x + cardWidth / 2, cardY + 12, { align: "center" });
  });

  // Tabla de Cortes
  const tableData = (reporte.cortes || []).map((c) => [
    `Mes ${c.mes}`,
    formatDate(c.fecha_corte),
    formatCurrency(c.balance_inicial),
    `+ ${formatCurrency(c.total_ingresos)}`,
    `- ${formatCurrency(c.total_egresos)}`,
    formatCurrency(c.balance_al_corte),
    c.supero_limite ? "EXCEDIDO" : "EN REGLA",
  ]);

  autoTable(doc, {
    startY: cardY + cardHeight + 6,
    head: [["Mes", "Fecha Corte", "Bal. Inicial", "Ingresos", "Egresos", "Balance al Corte", "Estado Límite"]],
    body: tableData.length > 0 ? tableData : [["Sin registros de cortes para el año seleccionado", "", "", "", "", "", ""]],
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: "center", fontStyle: "bold", cellWidth: 20 },
      1: { halign: "center", cellWidth: 24 },
      2: { halign: "right", cellWidth: 28 },
      3: { halign: "right", textColor: [22, 101, 52], cellWidth: 28 },
      4: { halign: "right", textColor: [185, 28, 28], cellWidth: 28 },
      5: { halign: "right", fontStyle: "bold", textColor: [37, 99, 235], cellWidth: 30 },
      6: { halign: "center", fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 6) {
        if (data.cell.raw === "EXCEDIDO") {
          data.cell.styles.textColor = [220, 38, 38];
        } else if (data.cell.raw === "EN REGLA") {
          data.cell.styles.textColor = [22, 101, 52];
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  renderFooter(doc);
  doc.save(`Reporte_Cortes_Consolidados_${anio}.pdf`);
};

/**
 * 2. Exportar Reporte de Cumplimiento de Límites a PDF
 */
export const exportReporteLimitesPDF = (reporte) => {
  if (!reporte) return;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const startY = renderHeader(
    doc,
    "Reporte de Cumplimiento de Límites de Gastos",
    "Auditoría histórica de límites presupuestarios vs. egresos ejecutados"
  );

  const stats = reporte.estadisticas || {};
  const pageWidth = doc.internal.pageSize.getWidth();
  const cardWidth = (pageWidth - 28 - 8) / 3;
  const cardY = startY;
  const cardHeight = 16;

  const kpis = [
    { label: "Total Evaluaciones", val: String(stats.total_evaluaciones ?? 0), color: [30, 41, 59] },
    { label: "Periodos en Regla", val: String(stats.periodos_en_regla ?? 0), color: [22, 101, 52] },
    { label: "Periodos Excedidos", val: String(stats.periodos_excedidos ?? 0), color: [185, 28, 28] },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (cardWidth + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + cardWidth / 2, cardY + 5.5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...kpi.color);
    doc.text(kpi.val, x + cardWidth / 2, cardY + 12.5, { align: "center" });
  });

  const tableData = (reporte.historial || []).map((h) => [
    `${h.anio} - Mes ${h.mes}`,
    formatCurrency(h.limite_egresos_periodo),
    formatCurrency(h.total_egresos),
    `${h.porcentaje_consumido || 0}%`,
    h.supero_limite ? "EXCEDIDO" : "CUMPLIDO",
  ]);

  autoTable(doc, {
    startY: cardY + cardHeight + 6,
    head: [["Año / Mes", "Límite Establecido", "Total Egresos", "% Consumido", "Resultado"]],
    body: tableData.length > 0 ? tableData : [["Sin historial de cumplimiento registrado", "", "", "", ""]],
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: "center", fontStyle: "bold", cellWidth: 35 },
      1: { halign: "right", cellWidth: 40 },
      2: { halign: "right", fontStyle: "bold", cellWidth: 40 },
      3: { halign: "center", cellWidth: 32 },
      4: { halign: "center", fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        if (data.cell.raw === "EXCEDIDO") {
          data.cell.styles.textColor = [220, 38, 38];
        } else if (data.cell.raw === "CUMPLIDO") {
          data.cell.styles.textColor = [22, 101, 52];
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  renderFooter(doc);
  doc.save("Reporte_Cumplimiento_Limites.pdf");
};

/**
 * 3. Exportar Resumen de Evolución Anual a PDF
 */
export const exportResumenAnualPDF = (resumen, anio) => {
  if (!resumen) return;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const startY = renderHeader(
    doc,
    `Resumen de Evolución Financiera Anual - Año ${anio}`,
    "Comportamiento cronológico mensual de flujo de caja e ingresos vs. egresos"
  );

  let totalIngresos = 0;
  let totalEgresos = 0;
  let totalBalance = 0;

  const tableData = (resumen.meses || []).map((m) => {
    const ing = Number(m.ingresos ?? m.total_ingresos ?? 0);
    const egr = Number(m.egresos ?? m.total_egresos ?? 0);
    const bal = Number(m.balance ?? m.balance_al_corte ?? 0);

    totalIngresos += ing;
    totalEgresos += egr;
    totalBalance += bal;

    return [
      `Mes ${m.mes} (${m.nombre_mes})`,
      formatCurrency(ing),
      formatCurrency(egr),
      formatCurrency(bal),
      bal >= 0 ? "SUPERÁVIT" : "DÉFICIT",
    ];
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const cardWidth = (pageWidth - 28 - 8) / 3;
  const cardY = startY;
  const cardHeight = 16;

  const kpis = [
    { label: "Ingresos Acumulados", val: formatCurrency(totalIngresos), color: [22, 101, 52] },
    { label: "Egresos Acumulados", val: formatCurrency(totalEgresos), color: [185, 28, 28] },
    { label: "Balance Neto Anual", val: formatCurrency(totalBalance), color: totalBalance >= 0 ? [37, 99, 235] : [185, 28, 28] },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (cardWidth + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + cardWidth / 2, cardY + 5.5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...kpi.color);
    doc.text(kpi.val, x + cardWidth / 2, cardY + 12.5, { align: "center" });
  });

  autoTable(doc, {
    startY: cardY + cardHeight + 6,
    head: [["Mes", "Total Ingresos", "Total Egresos", "Balance Neto", "Resultado"]],
    body: tableData.length > 0 ? tableData : [["Sin datos mensuales disponibles", "", "", "", ""]],
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: "left", fontStyle: "bold", cellWidth: 45 },
      1: { halign: "right", textColor: [22, 101, 52], cellWidth: 35 },
      2: { halign: "right", textColor: [185, 28, 28], cellWidth: 35 },
      3: { halign: "right", fontStyle: "bold", cellWidth: 35 },
      4: { halign: "center", fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        if (data.cell.raw === "SUPERÁVIT") {
          data.cell.styles.textColor = [22, 101, 52];
        } else if (data.cell.raw === "DÉFICIT") {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  renderFooter(doc);
  doc.save(`Resumen_Evolucion_Anual_${anio}.pdf`);
};

/**
 * 4. Exportar Consulta Multidimensional de Transacciones a PDF
 */
export const exportConsultaPDF = (transacciones, resumen, query = {}) => {
  if (!transacciones) return;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const startY = renderHeader(
    doc,
    "Reporte de Consulta Multidimensional",
    "Listado detallado de transacciones financieras según criterios de filtrado"
  );

  const pageWidth = doc.internal.pageSize.getWidth();

  // Resumen de filtros aplicados
  const filtrosActivos = [];
  if (query.tipo_transaccion) filtrosActivos.push(`Tipo: ${query.tipo_transaccion}`);
  if (query.fecha_desde) filtrosActivos.push(`Desde: ${query.fecha_desde}`);
  if (query.fecha_hasta) filtrosActivos.push(`Hasta: ${query.fecha_hasta}`);
  if (query.monto_min) filtrosActivos.push(`Min: RD$ ${query.monto_min}`);
  if (query.monto_max) filtrosActivos.push(`Max: RD$ ${query.monto_max}`);
  if (query.busqueda) filtrosActivos.push(`Búsqueda: "${query.busqueda}"`);

  let currentY = startY;
  if (filtrosActivos.length > 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Filtros aplicados: ${filtrosActivos.join(" | ")}`, 14, currentY);
    currentY += 5;
  }

  // Tarjetas KPI de resumen
  const cardWidth = (pageWidth - 28 - 9) / 4;
  const cardHeight = 15;
  const kpis = [
    { label: "Registros", val: String(resumen?.total_registros || transacciones.length), color: [30, 41, 59] },
    { label: "Total Ingresos", val: formatCurrency(resumen?.total_ingresos || 0), color: [22, 101, 52] },
    { label: "Total Egresos", val: formatCurrency(resumen?.total_egresos || 0), color: [185, 28, 28] },
    {
      label: "Balance Neto",
      val: formatCurrency(resumen?.balance_neto || 0),
      color: (resumen?.balance_neto || 0) >= 0 ? [37, 99, 235] : [185, 28, 28],
    },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (cardWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + cardWidth / 2, currentY + 4.5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...kpi.color);
    doc.text(kpi.val, x + cardWidth / 2, currentY + 11, { align: "center" });
  });

  const tableData = transacciones.map((t) => [
    t.numero_transaccion,
    t.tipo_transaccion,
    formatDate(t.fecha_transaccion),
    t.concepto_descripcion || t.comentario || "-",
    formatCurrency(t.monto),
    t.estado || "ACTIVA",
  ]);

  autoTable(doc, {
    startY: currentY + cardHeight + 6,
    head: [["Folio", "Tipo", "Fecha", "Concepto / Descripción", "Monto", "Estado"]],
    body: tableData.length > 0 ? tableData : [["No se encontraron transacciones con los criterios seleccionados", "", "", "", "", ""]],
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: "center", fontStyle: "bold", cellWidth: 26 },
      1: { halign: "center", fontStyle: "bold", cellWidth: 20 },
      2: { halign: "center", cellWidth: 24 },
      3: { halign: "left", cellWidth: "auto" },
      4: { halign: "right", fontStyle: "bold", cellWidth: 30 },
      5: { halign: "center", cellWidth: 20 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      if (data.section === "body") {
        if (data.column.index === 1) {
          if (data.cell.raw === "INGRESO") {
            data.cell.styles.textColor = [22, 101, 52];
          } else if (data.cell.raw === "EGRESO") {
            data.cell.styles.textColor = [185, 28, 28];
          }
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  renderFooter(doc);
  doc.save("Consulta_Transacciones.pdf");
};
