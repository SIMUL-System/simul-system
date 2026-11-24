const PASSOS = [
  {
    titulo: 'Consulte seu bairro',
    texto:
      'Escolha a cidade e o bairro para ver os dias, os horários e a área atendida pela coleta seletiva.',
  },
  {
    titulo: 'Separe os recicláveis',
    texto:
      'Papel, plástico, vidro e metal limpos e secos, separados do lixo comum.',
  },
  {
    titulo: 'Receba o lembrete',
    texto:
      'Crie uma conta e escolha com quanta antecedência quer ser avisado por e-mail.',
  },
]

function ComoFunciona() {
  return (
    <section
      className="como-funciona"
      aria-labelledby="titulo-como-funciona"
    >
      <h2
        id="titulo-como-funciona"
        className="titulo-secao"
      >
        Como funciona
      </h2>

      <ol className="como-funciona__passos">
        {PASSOS.map((passo, indice) => (
          <li
            key={passo.titulo}
            className="como-funciona__passo"
          >
            <span
              className="como-funciona__numero"
              aria-hidden="true"
            >
              {indice + 1}
            </span>

            <div>
              <h3>{passo.titulo}</h3>
              <p>{passo.texto}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default ComoFunciona
