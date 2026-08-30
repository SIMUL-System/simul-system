import { useState } from 'react'
import '../App.css'
import { consultarColeta } from '../services/rotaService'

function ConsultaPage() {
  const [cidade, setCidade] = useState('')
  const [bairro, setBairro] = useState('')
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setErro('')
    setResultado(null)

    if (!cidade.trim() || !bairro.trim()) {
      setErro('Informe a cidade e o bairro.')
      return
    }

    try {
      setCarregando(true)

      const dados = await consultarColeta(
        cidade,
        bairro,
      )

      setResultado(dados)
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível consultar a coleta.',
      )
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="app">
      <section className="consulta">
        <header className="consulta__cabecalho">
          <span className="consulta__marca">
            SIMUL
          </span>

          <h1>
            Consulte a coleta seletiva da sua região
          </h1>

          <p>
            Informe sua cidade e bairro para consultar
            os dias e horários programados.
          </p>
        </header>

        <form
          className="consulta__formulario"
          onSubmit={handleSubmit}
        >
          <div className="campo">
            <label htmlFor="cidade">
              Cidade
            </label>

            <input
              id="cidade"
              type="text"
              value={cidade}
              onChange={(event) =>
                setCidade(event.target.value)
              }
              placeholder="Ex.: Senador Canedo"
              autoComplete="address-level2"
            />
          </div>

          <div className="campo">
            <label htmlFor="bairro">
              Bairro
            </label>

            <input
              id="bairro"
              type="text"
              value={bairro}
              onChange={(event) =>
                setBairro(event.target.value)
              }
              placeholder="Ex.: Jardim Nova Goiânia"
              autoComplete="address-level3"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
          >
            {carregando
              ? 'Consultando...'
              : 'Consultar coleta'}
          </button>
        </form>

        {erro && (
          <div
            className="mensagem mensagem--erro"
            role="alert"
          >
            {erro}
          </div>
        )}

        {resultado && (
          <section className="resultado">
            <h2>Coleta encontrada</h2>

            <div className="resultado__informacoes">
              <p>
                <strong>Cidade:</strong>{' '}
                {resultado.cidade}
              </p>

              <p>
                <strong>Bairro:</strong>{' '}
                {resultado.bairro}
              </p>

              <p>
                <strong>Rota:</strong>{' '}
                {resultado.nomeRota}
              </p>
            </div>

            <h3>Cronograma</h3>

            {resultado.cronogramas?.length > 0 ? (
              <div className="cronogramas">
                {resultado.cronogramas.map(
                  (cronograma, index) => (
                    <article
                      className="cronograma"
                      key={`${cronograma.diaSemana}-${index}`}
                    >
                      <strong>
                        {cronograma.diaSemana}
                      </strong>

                      <span>
                        {cronograma.horarioInicio}
                        {' — '}
                        {cronograma.horarioFim}
                      </span>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <p>
                Nenhum cronograma ativo encontrado.
              </p>
            )}
          </section>
        )}
      </section>
    </main>
  )
}

export default ConsultaPage