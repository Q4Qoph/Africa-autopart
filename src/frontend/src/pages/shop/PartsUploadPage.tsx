import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { partsApi } from '@/api/partsApi'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, ArrowLeft, Download, Info, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function PartsUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (selectedFile: File) => {
    setError(null)
    setSuccess(null)
    const extension = selectedFile.name.split('.').pop()?.toLowerCase()
    
    if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || extension === 'xlsx') {
      setFile(selectedFile)
    } else {
      setError('Only .xlsx Excel files are supported. Please upload an Excel Workbook (.xlsx)')
      setFile(null)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    setError(null)
    setSuccess(null)

    try {
      await partsApi.uploadPartsSeed(file)
      setSuccess(`Parts seed data uploaded and processed successfully! Database has been populated.`)
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      console.error(err)
      // Extract plaintext error response or structured JSON details
      const details = typeof err.response?.data === 'string'
        ? err.response.data
        : (err.response?.data?.message || err.message || 'Unknown seeding failure')
      setError(`Failed to seed parts: ${details}`)
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    const headers = ['Source File', 'Supplier', 'Row No', 'Part Code', 'Part Name', 'Applicable Model', 'Price', 'Picture']
    const rows = [
      {
        'Source File': '3X_新款',
        'Supplier': 'Supplier1',
        'Row No': 1,
        'Part Code': '602001140AADQJ',
        'Part Name': '前保险杠上体',
        'Applicable Model': '瑞虎3X新款',
        'Price': 310,
        'Picture': 'https://africaparts.blob.core.windows.net/africaparts/Supplier1_602001140AADQJ.png'
      },
      {
        'Source File': '3X_新款',
        'Supplier': 'Supplier1',
        'Row No': 2,
        'Part Code': 'J69-5512710',
        'Part Name': '前轮眉L',
        'Applicable Model': '3X/3X新款',
        'Price': 30,
        'Picture': 'https://africaparts.blob.core.windows.net/africaparts/Supplier1_J69-5512710.png'
      },
      {
        'Source File': 'T11_新款',
        'Supplier': 'Supplier2',
        'Row No': 1,
        'Part Code': 'T11-3001030',
        'Part Name': '前轮轴承',
        'Applicable Model': 'T11/A13/T15/3X',
        'Price': 35,
        'Picture': ''
      }
    ]

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers })
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Parts')

    // Write binary XLSX buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    // Trigger download
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "parts_seed_template.xlsx"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-grow flex flex-col min-h-screen">
      {/* Header breadcrumbs */}
      <section className="py-6 bg-gradient-to-br from-emerald-50/40 via-white to-slate-50/40 dark:from-emerald-950/10 dark:via-[#111C14]/30 dark:to-slate-950/10 border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-[800px] mx-auto px-6">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00C853] transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Catalog
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#00C853] mb-1">
            <span className="block w-6 h-px bg-[#00C853]" />
            Seeding Portal
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Seed Database & Upload Parts
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Populate or add batches of replacement components to the catalog database using formatted Excel templates.
          </p>
        </div>
      </section>

      {/* Main content body */}
      <div className="max-w-[800px] mx-auto w-full px-6 py-8 flex-grow space-y-8">
        
        {/* Info banner */}
        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200/40 dark:border-emerald-900/20 text-slate-600 dark:text-slate-400 flex items-start gap-3 text-xs leading-relaxed">
          <Info className="w-5 h-5 shrink-0 text-[#00C853] mt-0.5" />
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200">Excel Seeding Template</p>
            <p className="mt-0.5">
              Click the download button below to get the official template in Excel format (.xlsx). Add your records inside the sheet, then drag and drop the file below to populate your inventory.
            </p>
          </div>
        </div>

        {/* Upload form block */}
        <form onSubmit={handleUpload} className="p-6 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-[#111C14] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <FileSpreadsheet className="w-4 h-4 text-[#00C853]" />
              Spreadsheet Upload
            </h3>
            <button
              type="button"
              onClick={downloadTemplate}
              className="text-xs font-bold text-[#00C853] hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Download Excel Template (.xlsx)
            </button>
          </div>

          {/* Feedback banners */}
          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-400 flex items-start gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-500 mt-0.5" />
              <div>
                <p className="font-bold">Success!</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400/80 mt-0.5">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30 text-red-800 dark:text-red-400 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-500 mt-0.5" />
              <div>
                <p className="font-bold">Seeding Error</p>
                <p className="text-xs text-red-700 dark:text-red-400/80 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Drag & drop region */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-[#00C853] bg-[#00C853]/5'
                : 'border-slate-200 dark:border-slate-800 hover:border-[#00C853]/50 dark:hover:border-[#00C853]/30 bg-slate-50/50 dark:bg-slate-900/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx"
              className="hidden"
            />
            
            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 mb-3 group-hover:scale-105 transition-transform duration-200">
              <Upload className="w-8 h-8" />
            </div>
            
            {file ? (
              <div className="space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {file.name}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB • Excel Workbook (.xlsx) ready
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  Drag and drop your .xlsx spreadsheet here
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Supported format: Excel Workbook (.xlsx) (Max size 10MB)
                </p>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="flex justify-end border-t border-slate-100 dark:border-slate-900 pt-4">
            <button
              type="submit"
              disabled={!file || isUploading}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#00C853] hover:bg-[#39FF88] text-[#07110A] font-bold rounded-xl shadow-lg shadow-emerald-500/10 disabled:opacity-40 disabled:hover:bg-[#00C853] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                'Start Seeding Upload'
              )}
            </button>
          </div>
        </form>

        {/* Instructions Panel */}
        <div className="p-6 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-[#111C14] shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
            <Info className="w-4 h-4 text-[#00C853]" />
            Template Formatting Instructions
          </h3>
          
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-3 leading-relaxed">
            <p>
              The seeding processor parses the spreadsheet headers directly to mapping keys. Make sure your columns match the following case-sensitive headers exactly in sheet 1 of your Excel file:
            </p>

            {/* Table of columns */}
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-900 rounded-xl">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-900 font-mono text-[11px] text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Header</th>
                    <th className="px-4 py-2 font-semibold">Type</th>
                    <th className="px-4 py-2 font-semibold">Requirement</th>
                    <th className="px-4 py-2 font-semibold">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="px-4 py-2 font-bold text-[#00C853]">Source File</td>
                    <td className="px-4 py-2">String</td>
                    <td className="px-4 py-2 text-red-500 font-semibold">Required</td>
                    <td className="px-4 py-2">3X_新款</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-[#00C853]">Supplier</td>
                    <td className="px-4 py-2">String</td>
                    <td className="px-4 py-2 text-red-500 font-semibold">Required</td>
                    <td className="px-4 py-2">Supplier1</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-[#00C853]">Row No</td>
                    <td className="px-4 py-2">Numeric</td>
                    <td className="px-4 py-2 text-red-500 font-semibold">Required</td>
                    <td className="px-4 py-2">1</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-[#00C853]">Part Code</td>
                    <td className="px-4 py-2">String</td>
                    <td className="px-4 py-2 text-red-500 font-semibold">Required</td>
                    <td className="px-4 py-2">602001140AADQJ</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-[#00C853]">Part Name</td>
                    <td className="px-4 py-2">String</td>
                    <td className="px-4 py-2 text-red-500 font-semibold">Required</td>
                    <td className="px-4 py-2">前保险杠上体</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-[#00C853]">Applicable Model</td>
                    <td className="px-4 py-2">String</td>
                    <td className="px-4 py-2 text-slate-400">Optional</td>
                    <td className="px-4 py-2">瑞虎3X新款</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-[#00C853]">Price</td>
                    <td className="px-4 py-2">Numeric</td>
                    <td className="px-4 py-2 text-red-500 font-semibold">Required</td>
                    <td className="px-4 py-2">310</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-[#00C853]">Picture</td>
                    <td className="px-4 py-2">URL String</td>
                    <td className="px-4 py-2 text-slate-400">Optional</td>
                    <td className="px-4 py-2">https://africaparts.blob...</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <ul className="list-disc pl-4 space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>
                <strong>Excel Workbook Format:</strong> Make sure your file is saved and uploaded in Excel Workbook (.xlsx) format. Old XLS format or CSV format is not supported by the seeder API.
              </li>
              <li>
                <strong>Price Formatting:</strong> Price values must be raw numbers (e.g. <code>310</code> or <code>19.99</code>). Avoid placing currency symbols like <code>$</code> or commas inside the cells.
              </li>
              <li>
                <strong>Images:</strong> Make sure image URLs start with <code>http://</code> or <code>https://</code> and point directly to a hosted asset.
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
