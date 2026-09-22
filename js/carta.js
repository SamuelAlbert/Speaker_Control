/**
 * Montagem do HTML da carta (prévia e PDF).
 * Para alterar o texto fixo da carta, edite a função buildCartaHtml abaixo.
 */

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatDateBr(isoDate) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return "";
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
}

/**
 * @param {{ congregacao: string, orador: string, numeroDiscurso: string, tema: string, dataIso: string }} dados
 */
function buildCartaHtml(dados) {
  const c = CONGREGACAO;
  const congregacao = escapeHtml(dados.congregacao.trim());
  const orador = escapeHtml(dados.orador.trim());
  const numero = escapeHtml(String(dados.numeroDiscurso));
  const tema = escapeHtml(dados.tema.trim());
  const data = escapeHtml(formatDateBr(dados.dataIso));

  return `
    <article class="carta-documento" aria-label="Convite para proferir discurso público">
      <header class="carta-cabecalho">
        <p class="carta-nome-congregacao">${c.nomeCompleto}</p>
        <p class="carta-endereco">${c.enderecoLinha1}<br>${c.enderecoLinha2}</p>
        <p class="carta-telefone">Telefone: ${escapeHtml(c.telefone)}</p>
      </header>

      <h1 class="carta-titulo">CONVITE PARA PROFERIR DISCURSO PÚBLICO</h1>

      <section class="carta-corpo">
        <p class="carta-campo"><strong>À CONGREGAÇÃO:</strong> ${congregacao}</p>
        <p class="carta-subtitulo"><strong>A/C: Coordenador de Discursos</strong></p>

        <p>Prezados irmãos,</p>

        <p>É com muita alegria que entramos em contato com vocês, desejando que Jeová continue abençoando ricamente os esforços de toda a congregação.</p>

        <p>Como servos de Jeová, valorizamos muito as oportunidades de nos reunirmos e de recebermos encorajamento espiritual. Conforme Hebreus 10:24, 25 nos incentiva, essas ocasiões contribuem para fortalecer nossa fé e nosso amor por Jeová e pelos irmãos.</p>

        <p>Por isso, temos o prazer de convidar sua congregação para que um de seus irmãos habilitados nos visite e profira o seguinte discurso público:</p>

        <div class="carta-detalhes">
          <p class="carta-campo"><strong>ORADOR:</strong> ${orador}</p>
          <p class="carta-campo"><strong>DISCURSO Nº:</strong> ${numero}</p>
          <p class="carta-campo carta-campo-tema"><strong>TEMA:</strong> ${tema}</p>
          <p class="carta-campo"><strong>DATA:</strong> ${data}</p>
        </div>

        <p>Caso o irmão indicado não possa atender ao convite, pedimos, por favor, que nos informem assim que possível.</p>

        <p>Se houver alguma dificuldade em apresentar o tema indicado, solicitamos também que nos comuniquem com antecedência, para que possamos fazer os ajustes necessários.</p>

        <p>Agradecemos desde já pela atenção e pela disposição em colaborar para o fortalecimento espiritual das congregações. Temos certeza de que essa troca de encorajamento será uma ocasião muito agradável e edificante para todos.</p>

        <p>Que Jeová abençoe os esforços de vocês e continue usando nossos queridos irmãos para fortalecer e encorajar sua congregação.</p>
      </section>

      <footer class="carta-assinatura">
        <p><strong>Com amor cristão,</strong></p>
        <p class="carta-assinatura-nome"><strong>${escapeHtml(c.coordenadorNome)}</strong></p>
        <p>${escapeHtml(c.coordenadorCargo)}</p>
        <p>${escapeHtml(c.coordenadorCongregacao)}</p>
        <p>Telefone: ${escapeHtml(c.telefone)}</p>
        <p>E-mail: ${escapeHtml(c.email)}</p>
        <p class="carta-horario"><strong>Horário da reunião:</strong> ${escapeHtml(c.horarioReuniao)}</p>
      </footer>
    </article>
  `;
}

function getDiscursosOrdenados() {
  if (!Array.isArray(discursos)) return [];
  return [...discursos].sort((a, b) => Number(a.numero) - Number(b.numero));
}

function findDiscursoByNumero(numero) {
  const n = Number(numero);
  return getDiscursosOrdenados().find((d) => Number(d.numero) === n);
}
