import { nomeRotaCurto } from '../../../utils/areas'

/**
 * Lista de áreas com paginação simples. A linha aberta no painel
 * fica destacada.
 */
function TabelaAreas({
  areas,
  pagina,
  porPagina,
  areaAberta,
  mostrarCidade,
  onEditar,
  onMudarPagina,
}) {
  const totalPaginas = Math.max(1, Math.ceil(areas.length / porPagina))
  const inicio = (pagina - 1) * porPagina
  const visiveis = areas.slice(inicio, inicio + porPagina)

  if (areas.length === 0) {
    return <p className="admin-quadro__vazio">Nenhuma área encontrada com esses filtros.</p>
  }

  return (
    <>
      <div className="admin-tabela__rolagem">
        <table className="admin-tabela">
          <caption className="visualmente-oculto">
            Áreas atendidas, página {pagina} de {totalPaginas}
          </caption>

          <thead>
            <tr>
              <th scope="col">Bairro</th>
              {mostrarCidade && <th scope="col">Cidade</th>}
              <th scope="col" className="admin-tabela__secundaria">
                Rota
              </th>
              <th scope="col">Mapa</th>
              <th scope="col" className="admin-tabela__acoes">
                <span className="visualmente-oculto">Ações</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {visiveis.map((area) => {
              const aberta = areaAberta === area.id

              return (
                <tr key={area.id} className={aberta ? 'admin-tabela__linha--aberta' : ''}>
                  <th scope="row" className="admin-tabela__principal">
                    {area.bairro}
                  </th>
                  {mostrarCidade && <td>{area.cidade}</td>}
                  <td className="admin-tabela__secundaria" title={area.nomeRota}>
                    {nomeRotaCurto(area.nomeRota, area.cidade)}
                  </td>
                  <td>
                    <span
                      className={`selo ${area.possuiGeometria ? 'selo--ativo' : 'selo--pendente'}`}
                    >
                      {area.possuiGeometria ? 'Desenhada' : 'Sem desenho'}
                    </span>
                  </td>
                  <td className="admin-tabela__acoes">
                    <button
                      type="button"
                      className={`botao botao--pequeno ${aberta ? 'botao--primario' : 'botao--secundario'}`}
                      onClick={() => onEditar(area)}
                      aria-label={`Editar ${area.bairro}`}
                      aria-expanded={aberta}
                    >
                      {aberta ? 'Editando' : 'Editar'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <nav className="paginacao" aria-label="Páginas da lista de áreas">
        <span className="paginacao__texto">
          Mostrando {inicio + 1}–{Math.min(inicio + porPagina, areas.length)} de {areas.length}
        </span>

        <div className="paginacao__botoes">
          <button
            type="button"
            className="botao botao--pequeno botao--secundario"
            onClick={() => onMudarPagina(pagina - 1)}
            disabled={pagina <= 1}
          >
            Anterior
          </button>

          <span aria-live="polite">
            Página {pagina} de {totalPaginas}
          </span>

          <button
            type="button"
            className="botao botao--pequeno botao--secundario"
            onClick={() => onMudarPagina(pagina + 1)}
            disabled={pagina >= totalPaginas}
          >
            Próxima
          </button>
        </div>
      </nav>
    </>
  )
}

export default TabelaAreas
