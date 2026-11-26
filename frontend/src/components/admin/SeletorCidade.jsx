import Icone from '../Icone'

/**
 * Seletor da cidade do painel admin, em destaque no topo das telas de
 * rotas, áreas e agenda. Tudo abaixo dele mostra só a cidade escolhida.
 */
function SeletorCidade({ cidades, cidade, onTrocar }) {
  return (
    <section className="seletor-cidade" aria-label="Cidade do painel">
      <div className="seletor-cidade__campo">
        <label className="seletor-cidade__rotulo" htmlFor="admin-cidade">
          <Icone nome="local" tamanho={18} />
          Cidade
        </label>

        <select
          id="admin-cidade"
          className="campo-ds__controle seletor-cidade__select"
          value={cidade.id}
          onChange={(event) => onTrocar(Number(event.target.value))}
          aria-describedby="admin-cidade-resumo"
        >
          {cidades.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nome} ({item.uf})
            </option>
          ))}
        </select>
      </div>

      <p id="admin-cidade-resumo" className="seletor-cidade__resumo" aria-live="polite">
        <span>
          <strong>{cidade.bairros}</strong> {cidade.bairros === 1 ? 'bairro' : 'bairros'}
        </span>
        <span>
          <strong>{cidade.rotasAtivas}</strong>{' '}
          {cidade.rotasAtivas === 1 ? 'rota ativa' : 'rotas ativas'}
        </span>
        <span>
          <strong>{cidade.coletasAtivas}</strong>{' '}
          {cidade.coletasAtivas === 1 ? 'coleta na semana' : 'coletas na semana'}
        </span>
        {cidade.rotasTipoNaoInformado > 0 && (
          <span className="selo selo--pendente">Tipo de coleta não informado</span>
        )}
      </p>
    </section>
  )
}

export default SeletorCidade
