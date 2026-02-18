import React, { useState, useMemo, useEffect } from 'react'
import './Recibo.css'

function currency(num) {
  const n = Number(num) || 0
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function emptyLine() {
  return { id: Date.now() + Math.random(), desc: '', qty: 1, unit: 0 }
}

export default function Recibo() {
  const [lines, setLines] = useState([emptyLine()])
  const [data, setData] = useState('')
  const [nome, setNome] = useState('')
  const [endereco, setEndereco] = useState('')
  // Header editable states (persisted)
  const [tituloPrincipal, setTituloPrincipal] = useState('Ferragem e Lubrificantes')
  const [subtitulo, setSubtitulo] = useState('Materiais de Construção')
  const [telefone, setTelefone] = useState('98919-6576')

  // Header address lines (persisted)
  const [enderecoLinha1, setEnderecoLinha1] = useState('Rua 1, nº 98, Setor 2')
  const [enderecoLinha2, setEnderecoLinha2] = useState('Guajuviras - Canoas/RS')

  // Editing mode and draft values for cancel behavior
  const [editingHeader, setEditingHeader] = useState(false)
  const [draftTitulo, setDraftTitulo] = useState(tituloPrincipal)
  const [draftSubtitulo, setDraftSubtitulo] = useState(subtitulo)
  const [draftTelefone, setDraftTelefone] = useState(telefone)
  const [draftEnderecoLinha1, setDraftEnderecoLinha1] = useState(enderecoLinha1)
  const [draftEnderecoLinha2, setDraftEnderecoLinha2] = useState(enderecoLinha2)

  const updateLine = (id, key, value) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [key]: value } : l)),
    )
  }

  const addLine = () => setLines((prev) => [...prev, emptyLine()])

  const removeLine = (id) => setLines((prev) => prev.filter((l) => l.id !== id))

  const handlePrint = () => {
    window.print()
  }

  // Load header from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('reciboHeader')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.tituloPrincipal) setTituloPrincipal(parsed.tituloPrincipal)
        if (parsed.subtitulo) setSubtitulo(parsed.subtitulo)
        if (parsed.telefone) setTelefone(parsed.telefone)
        if (parsed.enderecoLinha1) setEnderecoLinha1(parsed.enderecoLinha1)
        if (parsed.enderecoLinha2) setEnderecoLinha2(parsed.enderecoLinha2)
      }
    } catch (e) {
      // ignore parse errors and keep defaults
    }
  }, [])

  // Persist header whenever it changes
  useEffect(() => {
    const payload = { tituloPrincipal, subtitulo, telefone }
    try {
      localStorage.setItem('reciboHeader', JSON.stringify(payload))
    } catch (e) {
      // ignore storage errors
    }
  }, [tituloPrincipal, subtitulo, telefone])

  const linesWithTotals = useMemo(
    () =>
      lines.map((l) => {
        const qty = Number(l.qty) || 0
        const unit = Number(l.unit) || 0
        return { ...l, total: qty * unit }
      }),
    [lines],
  )

  const grandTotal = useMemo(
    () => linesWithTotals.reduce((s, l) => s + l.total, 0),
    [linesWithTotals],
  )

  return (
    <div className="recibo-root">
      <div className="recibo-actions no-print">
        <button className="btn-add" onClick={addLine}>+ Adicionar Linha</button>
        <button className="btn-print" onClick={handlePrint}>Imprimir / Exportar PDF</button>
      </div>
      <div className="recibo-card">
        <header className="recibo-header">
          <div className="brand">
            {/* editable header: subtitulo and tituloPrincipal */}
            {editingHeader ? (
              <>
                <input
                  className="sub-input"
                  value={draftSubtitulo}
                  onChange={(e) => setDraftSubtitulo(e.target.value)}
                />
                <input
                  className="title-input"
                  value={draftTitulo}
                  onChange={(e) => setDraftTitulo(e.target.value)}
                />
              </>
            ) : (
              <>
                <div className="sub">{subtitulo}</div>
                <h1>{tituloPrincipal}</h1>
              </>
            )}
            {/* address: two lines, editable in edit mode */}
            {editingHeader ? (
              <div className="address-edit">
                <input
                  className="address-input"
                  value={draftEnderecoLinha1}
                  onChange={(e) => setDraftEnderecoLinha1(e.target.value)}
                />
                <input
                  className="address-input"
                  value={draftEnderecoLinha2}
                  onChange={(e) => setDraftEnderecoLinha2(e.target.value)}
                />
              </div>
            ) : (
              <div className="address">{enderecoLinha1}<br/>{enderecoLinha2}</div>
            )}
          </div>
          <div className="meta">
            <div className="phone">
              Fone/Whats:{' '}
              {editingHeader ? (
                <input
                  className="phone-input"
                  value={draftTelefone}
                  onChange={(e) => setDraftTelefone(e.target.value)}
                  aria-label="Telefone"
                />
              ) : (
                <span className="phone-text">{telefone}</span>
              )}
            </div>
            <label className="checkbox"><input type="checkbox"/> Orçamento</label>
            <div className="date">Data:
              <input
                type="date"
                className="date-input"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Header edit controls (outside printed area) */}
        <div className="recibo-header-actions no-print" style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:8}}>
          {!editingHeader ? (
            <button className="btn-edit" onClick={() => {
              // enter edit mode and seed drafts
              setDraftTitulo(tituloPrincipal)
              setDraftSubtitulo(subtitulo)
              setDraftTelefone(telefone)
              setDraftEnderecoLinha1(enderecoLinha1)
              setDraftEnderecoLinha2(enderecoLinha2)
              setEditingHeader(true)
            }}>Editar Cabeçalho</button>
          ) : (
            <>
              <button className="btn-save" onClick={() => {
                // apply drafts to main states
                setTituloPrincipal(draftTitulo)
                setSubtitulo(draftSubtitulo)
                setTelefone(draftTelefone)
                setEnderecoLinha1(draftEnderecoLinha1)
                setEnderecoLinha2(draftEnderecoLinha2)
                setEditingHeader(false)

                // explicitly persist full header (includes address)
                try {
                  const payload = {
                    tituloPrincipal: draftTitulo,
                    subtitulo: draftSubtitulo,
                    telefone: draftTelefone,
                    enderecoLinha1: draftEnderecoLinha1,
                    enderecoLinha2: draftEnderecoLinha2,
                  }
                  localStorage.setItem('reciboHeader', JSON.stringify(payload))
                } catch (e) {
                  // ignore storage errors
                }
              }}>Salvar</button>
              <button className="btn-cancel" onClick={() => {
                // discard drafts
                setDraftTitulo(tituloPrincipal)
                setDraftSubtitulo(subtitulo)
                setDraftTelefone(telefone)
                setDraftEnderecoLinha1(enderecoLinha1)
                setDraftEnderecoLinha2(enderecoLinha2)
                setEditingHeader(false)
              }}>Cancelar</button>
            </>
          )}
        </div>

        <div className="customer">
          <div className="field-row">
            <label className="field-label">Sr.:</label>
            <input
              type="text"
              className="cust-input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder=""
            />
          </div>
          <div className="field-row">
            <label className="field-label">End.:</label>
            <input
              type="text"
              className="cust-input"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder=""
            />
          </div>
        </div>

        <div className="table">
          <div className="table-head">
            <div className="col qty">Quant.</div>
            <div className="col desc">DISCRIMINAÇÃO</div>
            <div className="col unit">Unid.</div>
            <div className="col total">TOTAL</div>
          </div>

          <div className="table-body">
            {linesWithTotals.map((l, idx) => (
              <div key={l.id} className="table-row">
                <div className="col qty">
                  <input
                    type="number"
                    min="0"
                    value={l.qty}
                    onChange={(e) => updateLine(l.id, 'qty', e.target.value)}
                  />
                </div>
                <div className="col desc">
                  <input
                    type="text"
                    value={l.desc}
                    onChange={(e) => updateLine(l.id, 'desc', e.target.value)}
                    placeholder="Descrição"
                  />
                </div>
                <div className="col unit">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={l.unit}
                    onChange={(e) => updateLine(l.id, 'unit', e.target.value)}
                  />
                </div>
                <div className="col total">
                  <div className="line-total">{currency(l.total)}</div>
                  <button className="remove" onClick={() => removeLine(l.id)} aria-label="Remover linha">×</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* controls moved outside receipt for print exclusion */}

        <footer className="recibo-footer">
          <div className="left-note">Agradecemos a Preferência!</div>
          <div className="grand">
            <div className="label">TOTAL R$</div>
            <div className="amount">{currency(grandTotal)}</div>
          </div>
        </footer>
      </div>
    </div>
  )
}
