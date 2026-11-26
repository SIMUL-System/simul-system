import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Alerta from '../../components/Alerta'
import Icone from '../../components/Icone'
import FaixaTurnos from '../../components/admin/cidade/FaixaTurnos'

import { listarAreasAtendidas } from '../../services/adminAreaService'
import { listarCronogramas } from '../../services/adminCronogramaService'
import { listarRotas } from '../../services/adminRotaService'

import useCidadeAdmin from '../../hooks/useCidadeAdmin'

import { calcularResumo, diaDeHoje } from '../../utils/painel'
import { nomeRotaCurto } from '../../utils/areas'
import { comoLista } from '../../utils/texto'

/** Admin: indicadores, pendências e resumo da semana da cidade escolhida. */
function DashboardAdminPage() {
  const { cidade, cidades, trocarCidade, recarregarCidades } = useCidadeAdmin()
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState('')
  const [hoje] = useState(() => diaDeHoje(new Date().getDay()))

  useEffect(() => {
    let ativo = true

    Promise.all([
      listarRotas(cidade.id),
      listarAreasAtendidas(cidade.id),
      listarCronogramas(cidade.id),
    ])
      .then(([rotas, areas, cronogramas]) => {
        if (ativo) {
          setDados({
            rotas: comoLista(rotas),
            areas: comoLista(areas),
            cronogramas: comoLista(cronogramas),
          })
        }
      })
      .catch((error) => {
        if (ativo) setErro(error.message || 'Não foi possível carregar o resumo do painel.')
      })

    return () => {
      ativo = false
    }
  }, [cidade.id])

  if (erro) {
    return <Alerta tipo="erro">{erro}</Alerta>
  }

  if (!dados) {
    return (
      <div className="carregando" role="status">
        <span className="carregando__spinner" aria-hidden="true" />
        Carregando a visão geral…
      </div>
    )
  }

  const resumo = calcularResumo(dados)
  const maiorRota = Math.max(1, ...resumo.areasPorRota.map((item) => item.quantidade))

  const indicadores = [
    {
      rotulo: 'Rotas ativas',
      valor: resumo.totalRotasAtivas,
      detalhe: `de ${resumo.totalRotas} cadastradas`,
      link: '/admin/rotas',
    },
    {
      rotulo: 'Bairros atendidos',
      valor: resumo.totalAreas,
      detalhe: `em ${cidade.nome}`,
      link: '/admin/areas',
    },
    {
      rotulo: 'Coletas na semana',
      valor: resumo.totalHorarios,
      detalhe: 'dias e turnos em rotas ativas',
      link: '/admin/cronogramas',
    },
  ]

  return (
    <div className="admin-pagina">
      <header className="admin-pagina__cabecalho">
        <div>
          <h1 className="admin-pagina__titulo">Visão geral de {cidade.nome}</h1>
          <p className="admin-pagina__texto">
            O que está publicado para os moradores desta cidade e o que precisa de atenção.
          </p>
          {cidade.fonte && (
            <p className="campo-ds__dica painel-fonte">
              <Icone nome="info" tamanho={16} />
              Fonte dos dados: {cidade.fonte}
            </p>
          )}
        </div>

        <div className="admin-pagina__acoes">
          <Link to="/admin/cronogramas" className="botao botao--secundario">
            Agenda da semana
          </Link>
          <Link to="/admin/rotas" className="botao botao--primario">
            Rotas e bairros
          </Link>
        </div>
      </header>

      <ul className="indicadores" aria-label="Indicadores">
        {indicadores.map((item) => (
          <li key={item.rotulo}>
            <Link to={item.link} className="indicador">
              <span className="indicador__rotulo">{item.rotulo}</span>
              <strong className="indicador__valor">{item.valor}</strong>
              <span className="indicador__detalhe">
                {item.detalhe}
                <Icone nome="seta" tamanho={16} />
              </span>
            </Link>
          </li>
        ))}

        <li>
          <a
            href="#precisa-de-atencao"
            className={`indicador ${resumo.totalPendencias > 0 ? 'indicador--alerta' : 'indicador--ok'}`}
          >
            <span className="indicador__rotulo">Pendências</span>
            <strong className="indicador__valor">{resumo.totalPendencias}</strong>
            <span className="indicador__detalhe">
              {resumo.totalPendencias > 0 ? 'itens para revisar' : 'tudo em ordem'}
            </span>
          </a>
        </li>
      </ul>

      <div className="painel-grade">
        <section
          id="precisa-de-atencao"
          className="admin-quadro painel-bloco painel-grade__largo"
          aria-labelledby="titulo-atencao"
        >
          <h2 id="titulo-atencao" className="painel-bloco__titulo">
            Precisa de atenção
          </h2>

          <ul className="pendencias">
            {resumo.pendencias.map((item) => {
              const ok = item.quantidade === 0

              return (
                <li key={item.id} className="pendencia">
                  <span className={`pendencia__icone ${ok ? 'pendencia__icone--ok' : ''}`}>
                    <Icone nome={ok ? 'sucesso' : 'aviso'} tamanho={18} />
                  </span>

                  <div className="pendencia__texto">
                    <strong>{item.titulo}</strong>
                    <span>{item.texto}</span>
                  </div>

                  <span className="pendencia__numero">{item.quantidade}</span>

                  {ok ? (
                    <span className="selo selo--ativo">Tudo certo</span>
                  ) : (
                    <Link to={item.link} className="botao botao--pequeno botao--secundario">
                      {item.acao}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <section className="admin-quadro painel-bloco" aria-labelledby="titulo-areas-rota">
          <h2 id="titulo-areas-rota" className="painel-bloco__titulo">
            Bairros por rota
          </h2>

          {resumo.areasPorRota.length === 0 ? (
            <p className="admin-pagina__texto">Nenhuma rota ativa.</p>
          ) : (
            <ul className="barras">
              {resumo.areasPorRota.map(({ rota, quantidade }) => (
                <li key={rota.id}>
                  <Link to={`/admin/areas?rota=${rota.id}`} className="barras__item">
                    <span className="barras__topo">
                      <span>{nomeRotaCurto(rota.nome, cidade.nome)}</span>
                      <strong>{quantidade}</strong>
                    </span>
                    <span className="barras__trilho" aria-hidden="true">
                      <span
                        className="barras__valor"
                        style={{ width: `${(quantidade / maiorRota) * 100}%` }}
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {resumo.avisos.length > 0 && (
        <section className="admin-quadro painel-bloco" aria-labelledby="titulo-avisos">
          <h2 id="titulo-avisos" className="painel-bloco__titulo">
            O que a prefeitura não informa
          </h2>

          <ul className="pendencias">
            {resumo.avisos.map((item) => (
              <li key={item.id} className="pendencia">
                <span className="pendencia__icone pendencia__icone--info">
                  <Icone nome="info" tamanho={18} />
                </span>

                <div className="pendencia__texto">
                  <strong>{item.titulo}</strong>
                  <span>{item.texto}</span>
                </div>

                <span className="pendencia__numero">{item.quantidade}</span>

                <Link to={item.link} className="botao botao--pequeno botao--secundario">
                  {item.acao}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <FaixaTurnos key={cidade.id} cidade={cidade} onSalva={recarregarCidades} />

      {cidades.length > 1 && (
        <section className="admin-quadro painel-bloco" aria-labelledby="titulo-cidades">
          <h2 id="titulo-cidades" className="painel-bloco__titulo">
            Cidades atendidas
          </h2>

          <div className="tabela-rolavel">
            <table className="tabela-cidades">
              <caption className="visualmente-oculto">
                Bairros, rotas e coletas de cada cidade
              </caption>
              <thead>
                <tr>
                  <th scope="col">Cidade</th>
                  <th scope="col">Bairros</th>
                  <th scope="col">Rotas ativas</th>
                  <th scope="col">Coletas na semana</th>
                  <th scope="col">Sem horário exato</th>
                  <th scope="col">
                    <span className="visualmente-oculto">Ação</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {cidades.map((item) => {
                  const atual = item.id === cidade.id

                  return (
                    <tr key={item.id} aria-current={atual ? 'true' : undefined}>
                      <th scope="row">{item.nome}</th>
                      <td>{item.bairros}</td>
                      <td>{item.rotasAtivas}</td>
                      <td>{item.coletasAtivas}</td>
                      <td>{item.coletasSemHorario}</td>
                      <td>
                        {atual ? (
                          <span className="selo selo--info">Selecionada</span>
                        ) : (
                          <button
                            type="button"
                            className="botao-link"
                            onClick={() => trocarCidade(item.id)}
                          >
                            Abrir {item.nome}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="admin-quadro painel-bloco" aria-labelledby="titulo-semana">
        <div className="painel-bloco__topo">
          <h2 id="titulo-semana" className="painel-bloco__titulo">
            Coletas da semana
          </h2>
          <Link to="/admin/cronogramas">Abrir a agenda</Link>
        </div>

        <ol className="semana-resumo">
          {resumo.semana.map(({ dia, rotas }) => {
            const ehHoje = dia.valor === hoje

            return (
              <li
                key={dia.valor}
                className={[
                  'semana-resumo__dia',
                  ehHoje ? 'semana-resumo__dia--hoje' : '',
                  rotas === 0 ? 'semana-resumo__dia--vazio' : '',
                ].join(' ')}
                aria-current={ehHoje ? 'date' : undefined}
              >
                <span className="semana-resumo__nome">
                  <abbr title={dia.longo}>{dia.curto}</abbr>
                  {ehHoje && ' · hoje'}
                </span>
                <strong className="semana-resumo__numero">{rotas}</strong>
                <span className="semana-resumo__rotulo">
                  {rotas === 0 ? 'sem coleta' : rotas === 1 ? 'rota' : 'rotas'}
                </span>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}

export default DashboardAdminPage
