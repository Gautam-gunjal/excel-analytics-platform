import React, { useMemo, useState, useRef } from "react";
import Plot from "react-plotly.js";
import Plotly from "plotly.js-dist";
import { jsPDF } from "jspdf";

export default function ChartBuilder({ data }) {
  const [xKey, setXKey] = useState("");
  const [yKey, setYKey] = useState("");
  const [chartType, setChartType] = useState("scatter");

  const plotRef = useRef(null);

  const keys = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  // Filter + clean rows
  const cleanedRows = useMemo(() => {
    if (!Array.isArray(data) || !data.length || !xKey) return [];

    let rows = data.filter(
      (r) =>
        r.hasOwnProperty(xKey) &&
        r[xKey] !== null &&
        r[xKey] !== undefined &&
        !(typeof r[xKey] === "string" && r[xKey].trim() === "")
    );

    if (chartType !== "pie") {
      rows = rows.filter(
        (r) =>
          yKey &&
          r.hasOwnProperty(yKey) &&
          r[yKey] !== null &&
          r[yKey] !== undefined &&
          !(typeof r[yKey] === "string" && r[yKey].trim() === "")
      );

      rows = rows
        .map((r) => {
          const yRaw = r[yKey];
          const yNum = typeof yRaw === "number" ? yRaw : Number(yRaw);
          return Number.isNaN(yNum) ? null : { x: r[xKey], y: yNum };
        })
        .filter(Boolean);
    } else {
      if (yKey) {
        rows = rows
          .map((r) => {
            const yRaw = r[yKey];
            const yNum = typeof yRaw === "number" ? yRaw : Number(yRaw);
            return { x: r[xKey], y: Number.isNaN(yNum) ? 0 : yNum };
          })
          .filter(Boolean);
      } else {
        rows = rows.map((r) => ({ x: r[xKey], y: 1 }));
      }
    }

    return rows;
  }, [data, xKey, yKey, chartType]);

  const xValues = useMemo(
    () => (cleanedRows && cleanedRows.length ? cleanedRows.map((r) => r.x) : []),
    [cleanedRows]
  );
  const yValues = useMemo(
    () => (cleanedRows && cleanedRows.length ? cleanedRows.map((r) => r.y) : []),
    [cleanedRows]
  );

  // Build plotData
  const plotData = useMemo(() => {
    if (!cleanedRows || cleanedRows.length === 0) return [];

    if (chartType === "pie") {
      const map = {};
      cleanedRows.forEach((r) => {
        const label = r.x ?? "null";
        map[label] = (map[label] || 0) + (typeof r.y === "number" ? r.y : 0);
      });

      const labels = Object.keys(map);
      const values = labels.map((l) => map[l]);
      const allZero = values.every((v) => v === 0);
      if (labels.length === 0 || allZero) return [];

      return [
        {
          labels,
          values,
          type: "pie",
          textinfo: "label+percent",
          hoverinfo: "label+value+percent",
          hole: 0.3,
          marker: {
            colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#ec4899"],
          },
        },
      ];
    }

    if (chartType === "3d") {
      return [
        {
          x: xValues,
          y: yValues,
          z: cleanedRows.map((_, i) => i),
          type: "scatter3d",
          mode: "markers",
          marker: {
            size: 6,
            color: yValues,
            colorscale: "Viridis",
            opacity: 0.8,
          },
        },
      ];
    }

    const trace = {
      x: xValues,
      y: yValues,
      type: chartType === "line" ? "scatter" : chartType,
      mode: chartType === "line" ? "lines+markers" : "markers",
      marker: {
        color: chartType === "bar" ? "#10b981" : "#3b82f6",
        size: 8,
        opacity: 0.8,
        line: { width: 1, color: "#1e40af" },
      },
      line: { shape: "spline", color: "#3b82f6", width: 3 },
    };

    return [trace];
  }, [chartType, cleanedRows, xValues, yValues]);

  // PDF download
  const downloadPDF = async () => {
    if (!plotRef.current) {
      alert("No chart to download");
      return;
    }
    try {
      const gd = plotRef.current?.el || plotRef.current?.container || plotRef.current;
      if (!gd) throw new Error("Plot DOM node not found");
      const imgData = await Plotly.toImage(gd, { format: "png", width: 1200, height: 800 });
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1200, 800] });
      pdf.addImage(imgData, "PNG", 0, 0, 1200, 800);
      pdf.save("chart.pdf");
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Failed to export chart as PDF");
    }
  };

  // Layout
  const layout = {
    width: 800,
    height: 600,
    title: {
      text:
        chartType === "pie"
          ? `Pie Chart of ${xKey}${yKey ? ` (sized by ${yKey})` : ""}`
          : `${chartType.toUpperCase()} of ${xKey}${yKey ? ` vs ${yKey}` : ""}`,
      font: { size: 22, color: "#1f2937" },
      x: 0.05,
      xanchor: "left",
    },
    plot_bgcolor: "#ffffff",
    paper_bgcolor: "#f9fafb",
    margin: { l: 60, r: 30, t: 60, b: 60 },
    xaxis: {
      gridcolor: "#e5e7eb",
      zeroline: false,
      title: { text: xKey, font: { size: 16, color: "#374151" } },
    },
    yaxis: {
      gridcolor: "#e5e7eb",
      zeroline: false,
      title: { text: yKey, font: { size: 16, color: "#374151" } },
    },
    legend: {
      orientation: "h",
      y: -0.2,
      x: 0.5,
      xanchor: "center",
      font: { size: 14, color: "#1f2937" },
    },
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ["lasso2d", "select2d"],
  };

  return (
    <div className="chart-builder">
      {!data ? (
        <p>Select or upload an Excel to begin.</p>
      ) : (
        <>
          <div className="controls">
            <label>
              X axis:
              <select value={xKey} onChange={(e) => setXKey(e.target.value)}>
                <option value="">--select--</option>
                {keys.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>

            {chartType !== "pie" && (
              <label>
                Y axis:
                <select value={yKey} onChange={(e) => setYKey(e.target.value)}>
                  <option value="">--select--</option>
                  {keys.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label>
              Chart type:
              <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
                <option value="scatter">Scatter</option>
                <option value="line">Line</option>
                <option value="bar">Bar</option>
                <option value="pie">Pie</option>
                <option value="3d">3D Scatter</option>
              </select>
            </label>

            <button onClick={downloadPDF} disabled={!plotData.length}>
              Download PDF
            </button>
          </div>

          <div className="plot-area">
            {plotData.length ? (
              <Plot ref={plotRef} data={plotData} layout={layout} config={config} />
            ) : (
              <div style={{ padding: 12 }}>
                {!xKey && <p>Please select an X axis.</p>}
                {xKey && chartType !== "pie" && !yKey && <p>Please select a Y axis.</p>}
                {xKey && (chartType === "pie" || yKey) && cleanedRows.length === 0 && (
                  <p>No valid rows found for the selected axes — check for empty or non-numeric values.</p>
                )}
                {!xKey && <p>Choose X (and Y for non-pie) to generate chart.</p>}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
