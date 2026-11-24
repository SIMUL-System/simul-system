import { useState } from 'react'

import Icone from '../../Icone'
import { encontrarDuplicada, resumirColetaDaRota } from '../../../utils/areas'
import { normalizarTexto } from '../../../utils/texto'

/**
 * Cria ou edita uma área (cidade, bairro e rota). Na edição, mostra
 * também a situação do contorno no mapa e o botão para desenhá-lo.
 */
function FormArea({
  area,
  areas,
  rotas,
  cronogramas,
  cidades,
  salvando,
  onEnviar,
  onAbrirContorno,
}) {
  const [cidade, setCidade] = useState(area?.cidade ?? (cidades.length === 1 ? cidades[0] : ''))
  const [bairro, setBairro] = useState(area?.bairro ?? '')
  const [rotaId, setRotaId] = useState(area ? String(area.rotaId) : '')
  const [erros, setErros] = useState({})

  function handleSubmit(event) {
    event.preventDefault()

    const dados = {
      cidade: normalizarTexto(cidade),
      bairro: normalizarTexto(bairro),
      rotaId: Number(rotaId),
    }

    const novosErros = {}

    if (!dados.cidade) novosErros.cidade = 'Informe a cidade.'
    if (!dados.bairro) novosErros.bairro = 'Informe o bairro.'
    if (!rotaId) novosErros.rota = 'Escolha a rota que atende este bairro.'

    if (dados.cidade && dados.bairro && encontrarDuplicada(areas, { id: area?.id, ...dados })) {
      novosErros.bairro = `${dados.bairro} já está cadastrado em ${dados.cidade}.`
    }

    setErros(novosErros)

    if (Object.keys(novosErros).length === 0) {
      onEnviar(dados)
    }
  }

  function campoErro(id, mensagem) {
    if (!mensagem) return null

    return (
      <p id={`${id}-erro`} className="campo-ds__erro" role="alert">
        <Icone nome="erro" tamanho={16} />
        {mensagem}
      </p>
    )
  }

  return (
    <form className="painel-form" onSubmit={handleSubmit} noValidate>
      <div className="painel-form__dupla">
        <div className="campo-ds">
          <label className="campo-ds__rotulo" htmlFor="area-cidade">
            Cidade
          </label>
          <input
            id="area-cidade"
            className="campo-ds__controle"
            list="area-cidades"
            value={cidade}
            maxLength={120}
            onChange={(event) => setCidade(event.target.value)}
            aria-invalid={Boolean(erros.cidade)}
            aria-describedby={erros.cidade ? 'area-cidade-erro' : undefined}
            disabled={salvando}
          />
          <datalist id="area-cidades">
            {cidades.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          {campoErro('area-cidade', erros.cidade)}
        </div>

        <div className="campo-ds">
          <label className="campo-ds__rotulo" htmlFor="area-bairro">
            Bairro
          </label>
          <input
            id="area-bairro"
            className="campo-ds__controle"
            value={bairro}
            maxLength={120}
            onChange={(event) => setBairro(event.target.value)}
            aria-invalid={Boolean(erros.bairro)}
            aria-describedby={erros.bairro ? 'area-bairro-erro' : undefined}
            disabled={salvando}
          />
          {campoErro('area-bairro', erros.bairro)}
        </div>
      </div>

      <div className="campo-ds">
        <label className="campo-ds__rotulo" htmlFor="area-rota">
          Rota
        </label>
        <select
          id="area-rota"
          className="campo-ds__controle"
          value={rotaId}
          onChange={(event) => setRotaId(event.target.value)}
          aria-invalid={Boolean(erros.rota)}
          aria-describedby={erros.rota ? 'area-rota-erro' : 'area-rota-dica'}
          disabled={salvando}
        >
          <option value="">Selecione a rota</option>
          {rotas.map((rota) => (
            <option key={rota.id} value={rota.id}>
              {rota.nome}
              {rota.ativo ? '' : ' (inativa)'}
            </option>
          ))}
        </select>
        {erros.rota ? (
          campoErro('area-rota', erros.rota)
        ) : (
          <p id="area-rota-dica" className="campo-ds__dica">
            {rotaId
              ? resumirColetaDaRota(cronogramas, Number(rotaId))
              : 'Os dias e horários do bairro vêm da rota escolhida.'}
          </p>
        )}
      </div>

      <div className="painel-form__acoes">
        <button
          type="submit"
          className="botao botao--primario painel-form__principal"
          disabled={salvando}
        >
          {salvando ? 'Salvando…' : area ? 'Salvar área' : 'Cadastrar área'}
        </button>
      </div>

      <div className="contorno-resumo">
        <div className="contorno-resumo__texto">
          <strong>Contorno no mapa</strong>
          {area ? (
            <span>
              <span className={`selo ${area.possuiGeometria ? 'selo--ativo' : 'selo--pendente'}`}>
                {area.possuiGeometria ? 'Desenhado' : 'Sem desenho'}
              </span>{' '}
              {area.possuiGeometria
                ? 'O morador vê o contorno do bairro no mapa da consulta.'
                : 'Sem contorno próprio, o mapa da consulta usa o que o OpenStreetMap encontrar, que pode ser impreciso.'}
            </span>
          ) : (
            <span>Depois de cadastrar a área, você poderá desenhar o contorno.</span>
          )}
        </div>

        {area && (
          <button
            type="button"
            className="botao botao--secundario"
            onClick={onAbrirContorno}
            disabled={salvando}
          >
            <Icone nome="local" />
            {area.possuiGeometria ? 'Ajustar contorno' : 'Desenhar contorno'}
          </button>
        )}
      </div>
    </form>
  )
}

export default FormArea
