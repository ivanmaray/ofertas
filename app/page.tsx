import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedPriceColumn, setSelectedPriceColumn] = useState<string>("");
  const [basedatos, setBasedatos] = useState<any[]>([]);
  const [searchPrincipio, setSearchPrincipio] = useState('');
  const [searchPresentacion, setSearchPresentacion] = useState('');

  useEffect(() => {
    // Load basedatos.xlsx on startup
    fetch("/basedatos.xlsx")
      .then((res) => res.arrayBuffer())
      .then((data) => {
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setBasedatos(jsonData);
      })
      .catch((err) => console.error("Error loading basedatos:", err));
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles(selectedFiles);
      // Read the first file for preview
      const file = selectedFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (jsonData.length > 0) {
          setColumns(jsonData[0] as string[]);
          setPreviewData(jsonData.slice(1, 21)); // First 20 rows
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleProcess = () => {
    if (!files || !selectedPriceColumn) return;
    // Process all files
    const allData: any[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (jsonData.length > 1) {
            const headers = jsonData[0] as string[];
            const priceIndex = headers.indexOf(selectedPriceColumn);
            if (priceIndex !== -1) {
              jsonData.slice(1).forEach((row: any) => {
                if (row[priceIndex]) {
                  const cn = row[headers.indexOf("CN")] || "";
                  const basedatosEntry = basedatos.find((b) => b.CN === cn);
                  allData.push({
                    cn,
                    precio: row[priceIndex],
                    laboratorio: row[headers.indexOf("LABORATORIO")] || "",
                    principio_activo: basedatosEntry?.principio_activo || "",
                    presentacion: basedatosEntry?.presentacion || "",
                    fecha_alta: basedatosEntry?.fecha_alta || "",
                    problema_suministro: basedatosEntry?.problema_suministro || "",
                  });
                }
              });
            }
          }
        });
        setData(allData);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesPrincipio = searchPrincipio === '' || row.principio_activo.toLowerCase().includes(searchPrincipio.toLowerCase());
      const matchesPresentacion = searchPresentacion === '' || row.presentacion.toLowerCase().includes(searchPresentacion.toLowerCase());
      return matchesPrincipio && matchesPresentacion;
    });
  }, [data, searchPrincipio, searchPresentacion]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Analizador de Ofertas Farmacéuticas
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Subir Archivos</h2>
          <input
            type="file"
            multiple
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {files && (
            <p className="mt-2 text-sm text-gray-600">
              {files.length} archivo(s) seleccionado(s)
            </p>
          )}
        </div>

        {previewData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Vista Previa (Primeras 20 filas)
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Columna de Precio
              </label>
              <select
                value={selectedPriceColumn}
                onChange={(e) => setSelectedPriceColumn(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar columna...</option>
                {columns.map((col, idx) => (
                  <option key={idx} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr>
                    {columns.map((col, idx) => (
                      <th key={idx} className="px-4 py-2 border">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx}>
                      {row.map((cell: any, cellIdx: number) => (
                        <td key={cellIdx} className="px-4 py-2 border">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={handleProcess}
              disabled={!selectedPriceColumn}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              Procesar Ofertas
            </button>
          </div>
        )}

        {data.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Resultados</h2>
            <div className="mb-4 flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar por Principio Activo
                </label>
                <input
                  type="text"
                  value={searchPrincipio}
                  onChange={(e) => setSearchPrincipio(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingrese principio activo..."
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar por Presentación
                </label>
                <input
                  type="text"
                  value={searchPresentacion}
                  onChange={(e) => setSearchPresentacion(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingrese presentación..."
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">CN</th>
                    <th className="px-4 py-2 border">Precio</th>
                    <th className="px-4 py-2 border">Laboratorio</th>
                    <th className="px-4 py-2 border">Principio Activo</th>
                    <th className="px-4 py-2 border">Presentación</th>
                    <th className="px-4 py-2 border">Fecha Alta</th>
                    <th className="px-4 py-2 border">Problema Suministro</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 border">{row.cn}</td>
                      <td className="px-4 py-2 border">{row.precio}</td>
                      <td className="px-4 py-2 border">{row.laboratorio}</td>
                      <td className="px-4 py-2 border">{row.principio_activo}</td>
                      <td className="px-4 py-2 border">{row.presentacion}</td>
                      <td className="px-4 py-2 border">{row.fecha_alta}</td>
                      <td className="px-4 py-2 border">{row.problema_suministro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
