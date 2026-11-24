import { Link } from 'react-router-dom'

/**
 * Tabela de rotas com o interruptor de ativa na própria linha.
 */
function TabelaRotas({ linhas, rotaAberta, alterandoId, onEditar, onAlternarStatus }) {
  if (linhas.length === 0) {
    return <p className="admin-quadro__vazio">Nenhuma rota encontrada com esses filtros.</p>
  }

  return (
    <div className="admin-tabela__rolagem">
      <table className="admin-tabela">
        <caption className="visualmente-oculto">Rotas cadastradas</caption>

        <thead>
          <tr>
            <th scope="col">Rota</th>
            <th scope="col" className="admin-tabela__secundaria">
              Coleta
            </th>
            <th scope="col">Bairros</th>
            <th scope="col">Ativa</th>
            <th scope="col" className="admin-tabela__acoes">
              <span className="visualmente-oculto">Ações</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {linhas.map(({ rota, quantidadeAreas, coleta }) => {
            const aberta = rotaAberta === rota.id

            return (
              <tr
                key={rota.id}
                className={[
                  aberta ? 'admin-tabela__linha--aberta' : '',
                  rota.ativo ? '' : 'admin-tabela__linha--inativa',
                ].join(' ')}
              >
                <th scope="row" className="admin-tabela__principal">
                  <span>{rota.nome}</span>
                  {rota.descricao && (
                    <span className="admin-tabela__detalhe">{rota.descricao}</span>
                  )}
                </th>

                <td className="admin-tabela__secundaria">{coleta}</td>

                <td>
                  {quantidadeAreas > 0 ? (
                    <Link to={`/admin/areas?rota=${rota.id}`}>
                      {quantidadeAreas === 1 ? '1 bairro' : `${quantidadeAreas} bairros`}
                    </Link>
                  ) : (
                    <span className="selo selo--pendente">Nenhum</span>
                  )}
                </td>

                <td>
                  <button
                    type="button"
                    role="switch"
                    className="interruptor-linha"
                    aria-checked={Boolean(rota.ativo)}
                    aria-label={`${rota.nome} ativa`}
                    onClick={() => onAlternarStatus(rota)}
                    disabled={alterandoId === rota.id}
                  >
                    <span className="interruptor-linha__trilho" aria-hidden="true">
                      <span className="interruptor-linha__botao" />
                    </span>
                    <span className="interruptor-linha__texto">{rota.ativo ? 'Sim' : 'Não'}</span>
                  </button>
                </td>

                <td className="admin-tabela__acoes">
                  <button
                    type="button"
                    className={`botao botao--pequeno ${aberta ? 'botao--primario' : 'botao--secundario'}`}
                    onClick={() => onEditar(rota)}
                    aria-label={`Editar ${rota.nome}`}
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
  )
}

export default TabelaRotas
