(function () {
  "use strict";

  const form = document.getElementById("form-convite");
  const inputCongregacao = document.getElementById("congregacao");
  const inputOrador = document.getElementById("orador");
  const selectDiscurso = document.getElementById("discurso");
  const inputData = document.getElementById("data");
  const temaValor = document.getElementById("tema-valor");
  const mensagemErro = document.getElementById("mensagem-erro");
  const avisoDiscursos = document.getElementById("aviso-discursos");

  const btnVisualizar = document.getElementById("btn-visualizar");
  const btnGerar = document.getElementById("btn-gerar");
  const btnLimpar = document.getElementById("btn-limpar");

  const modal = document.getElementById("modal-preview");
  const previewContainer = document.getElementById("preview-carta");
  const btnFecharPreview = document.getElementById("btn-fechar-preview");
  const btnGerarDoPreview = document.getElementById("btn-gerar-do-preview");

  const pdfSource = document.getElementById("pdf-source");
  const painelPdf = document.getElementById("painel-pdf");
  const btnCompartilhar = document.getElementById("btn-compartilhar");
  const btnAbrirPdf = document.getElementById("btn-abrir-pdf");
  const btnBaixarPdf = document.getElementById("btn-baixar-pdf");
  const btnNovoConvite = document.getElementById("btn-novo-convite");

  let ultimoPdfBlob = null;
  let ultimoPdfNome = "convite-discurso.pdf";

  const A4_ALTURA_MM = 297;
  const MM_TO_PX = 96 / 25.4;

  function initDiscursosSelect() {
    const lista = getDiscursosOrdenados();
    selectDiscurso.innerHTML = "";

    if (lista.length === 0) {
      avisoDiscursos.hidden = false;
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "Nenhum discurso cadastrado ainda";
      selectDiscurso.appendChild(opt);
      selectDiscurso.disabled = true;
      btnGerar.disabled = true;
      btnVisualizar.disabled = true;
      return;
    }

    avisoDiscursos.hidden = true;
    selectDiscurso.disabled = false;
    btnGerar.disabled = false;
    btnVisualizar.disabled = false;

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Selecione o número do discurso";
    selectDiscurso.appendChild(placeholder);

    lista.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = String(d.numero);
      opt.textContent = `${d.numero} — ${d.tema}`;
      opt.dataset.tema = d.tema;
      selectDiscurso.appendChild(opt);
    });
  }

  function atualizarTema() {
    const numero = selectDiscurso.value;
    if (!numero) {
      temaValor.textContent = "Selecione um discurso acima";
      temaValor.classList.add("vazio");
      return;
    }
    const disc = findDiscursoByNumero(numero);
    if (disc) {
      temaValor.textContent = disc.tema;
      temaValor.classList.remove("vazio");
    } else {
      temaValor.textContent = "Discurso não encontrado";
      temaValor.classList.add("vazio");
    }
  }

  function lerFormulario() {
    const numero = selectDiscurso.value;
    const disc = numero ? findDiscursoByNumero(numero) : null;
    return {
      congregacao: inputCongregacao.value,
      orador: inputOrador.value,
      numeroDiscurso: numero,
      tema: disc ? disc.tema : "",
      dataIso: inputData.value,
    };
  }

  function validar(dados) {
    if (!dados.congregacao.trim()) {
      return "Informe a congregação que receberá o convite.";
    }
    if (!dados.orador.trim()) {
      return "Informe o nome do orador.";
    }
    if (!dados.numeroDiscurso) {
      return "Selecione o número do discurso.";
    }
    if (!dados.tema.trim()) {
      return "O tema do discurso não foi encontrado. Verifique a lista em discursos.js.";
    }
    if (!dados.dataIso) {
      return "Selecione a data do discurso.";
    }
    return null;
  }

  function mostrarErro(texto) {
    mensagemErro.textContent = texto;
    mensagemErro.classList.add("visivel");
    mensagemErro.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function limparErro() {
    mensagemErro.textContent = "";
    mensagemErro.classList.remove("visivel");
  }

  function renderizarCarta(container, dados) {
    container.innerHTML = buildCartaHtml(dados);
  }

  function abrirPreview() {
    limparErro();
    const dados = lerFormulario();
    const erro = validar(dados);
    if (erro) {
      mostrarErro(erro);
      return;
    }
    renderizarCarta(previewContainer, dados);
    ajustarCartaUmaPagina(previewContainer);
    modal.classList.add("aberto");
    document.body.style.overflow = "hidden";
  }

  function fecharPreview() {
    modal.classList.remove("aberto");
    document.body.style.overflow = "";
  }

  function ajustarCartaUmaPagina(rootEl) {
    const doc = (rootEl.classList && rootEl.classList.contains("carta-documento")
      ? rootEl
      : rootEl.querySelector(".carta-documento"));
    if (!doc) return;

    doc.style.fontSize = "";
    const maxHeightPx = (A4_ALTURA_MM - 4) * MM_TO_PX;
    let fontSize = parseFloat(getComputedStyle(doc).fontSize) || 14;
    let safety = 0;

    while (doc.scrollHeight > maxHeightPx && fontSize > 7.5 && safety < 40) {
      fontSize -= 0.35;
      doc.style.fontSize = fontSize + "px";
      safety += 1;
    }
  }

  function nomeArquivoPdf(dados) {
    const cong = dados.congregacao.trim().replace(/[^\w\s-àáâãéêíóôõúçÀÁÂÃÉÊÍÓÔÕÚÇ]/gi, "").slice(0, 30);
    const slug = cong.replace(/\s+/g, "-").toLowerCase() || "convite";
    return `convite-${slug}.pdf`;
  }

  async function gerarPdf() {
    limparErro();
    const dados = lerFormulario();
    const erro = validar(dados);
    if (erro) {
      mostrarErro(erro);
      return null;
    }

    if (typeof html2pdf === "undefined") {
      mostrarErro("A biblioteca de PDF não carregou. Verifique sua conexão e recarregue a página.");
      return null;
    }

    renderizarCarta(pdfSource, dados);
    ajustarCartaUmaPagina(pdfSource);

    const element = pdfSource.querySelector(".carta-documento");
    ultimoPdfNome = nomeArquivoPdf(dados);

    btnGerar.disabled = true;
    btnVisualizar.disabled = true;
    const textoOriginal = btnGerar.textContent;
    btnGerar.textContent = "Gerando PDF…";

    try {
      const opcoesPdf = {
        margin: [0, 0, 0, 0],
        filename: ultimoPdfNome,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: element.scrollWidth,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      const worker = html2pdf().set(opcoesPdf).from(element);
      const blob = await worker.outputPdf("blob");
      ultimoPdfBlob = blob;

      const urlDownload = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urlDownload;
      link.download = ultimoPdfNome;
      link.click();
      setTimeout(() => URL.revokeObjectURL(urlDownload), 5000);

      fecharPreview();
      mostrarPainelPdf();
      return blob;
    } catch (e) {
      console.error(e);
      mostrarErro("Não foi possível gerar o PDF. Tente novamente ou use outro navegador.");
      return null;
    } finally {
      btnGerar.disabled = getDiscursosOrdenados().length === 0;
      btnVisualizar.disabled = getDiscursosOrdenados().length === 0;
      btnGerar.textContent = textoOriginal;
      element.style.fontSize = "";
    }
  }

  function podeCompartilharArquivo() {
    if (!ultimoPdfBlob || typeof navigator.share !== "function") return false;
    if (typeof navigator.canShare !== "function") return true;
    try {
      const file = new File([ultimoPdfBlob], ultimoPdfNome, { type: "application/pdf" });
      return navigator.canShare({ files: [file] });
    } catch {
      return false;
    }
  }

  function mostrarPainelPdf() {
    painelPdf.classList.add("visivel");
    btnCompartilhar.hidden = !podeCompartilharArquivo();
    painelPdf.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function abrirPdfNovaAba() {
    if (!ultimoPdfBlob) return;
    const url = URL.createObjectURL(ultimoPdfBlob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function baixarPdfNovamente() {
    if (!ultimoPdfBlob) return;
    const url = URL.createObjectURL(ultimoPdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ultimoPdfNome;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  async function compartilharPdf() {
    if (!ultimoPdfBlob) return;
    const file = new File([ultimoPdfBlob], ultimoPdfNome, { type: "application/pdf" });
    try {
      await navigator.share({
        title: "Convite para discurso público",
        text: "Convite da Congregação Bagueira – Linhares, ES",
        files: [file],
      });
    } catch (e) {
      if (e.name !== "AbortError") {
        baixarPdfNovamente();
      }
    }
  }

  function limparFormulario() {
    form.reset();
    atualizarTema();
    limparErro();
    painelPdf.classList.remove("visivel");
    ultimoPdfBlob = null;
    inputCongregacao.focus();
  }

  selectDiscurso.addEventListener("change", atualizarTema);
  btnVisualizar.addEventListener("click", abrirPreview);
  btnGerar.addEventListener("click", () => gerarPdf());
  btnGerarDoPreview.addEventListener("click", () => gerarPdf());
  btnFecharPreview.addEventListener("click", fecharPreview);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharPreview();
  });
  btnLimpar.addEventListener("click", limparFormulario);
  btnCompartilhar.addEventListener("click", compartilharPdf);
  btnAbrirPdf.addEventListener("click", abrirPdfNovaAba);
  btnBaixarPdf.addEventListener("click", baixarPdfNovamente);
  btnNovoConvite.addEventListener("click", () => {
    painelPdf.classList.remove("visivel");
    ultimoPdfBlob = null;
    window.scrollTo({ top: 0, behavior: "smooth" });
    inputCongregacao.focus();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("aberto")) {
      fecharPreview();
    }
  });

  initDiscursosSelect();
  atualizarTema();
})();
