const agrupadores = {
  pendentes: {
    agrupadorId: "agrPendentesCiencia_header",
    gridId: "expedientePendenteGridId",
    titulo: "Pendentes de ciência ou de seu registro",
  },
  confirmadasDentroPrazo: {
    agrupadorId: "agrConfirmadasPublicadasRegistradas_header",
    gridId: "expedienteConfirmadoGridId",
    titulo: "Comunicações confirmadas e dentro do prazo",
  },
  prazoFindou10Dias: {
    agrupadorId: "agrPrazoFindou_header",
    gridId: "expedienteFimPrazoDezGridId",
    titulo: "Cujo prazo findou nos últimos 10 dias",
  },
  ciencia30DiasSemPrazo: {
    agrupadorId: "agrSemPrazo_header",
    gridId: "expedienteSemPrazoGridId",
    titulo: "Ciência nos últimos 30 dias, sem prazo",
  },
  processosSemAudienciaMarcada: {
    agrupadorId: "agrProcAudNaoDesignada_header",
    gridId: "processoAudienciaNaoMarcadaAdvogadoGridId",
    titulo: "Processos sem audiências designadas",
  },
  respondidas10Dias: {
    agrupadorId: "agrExpedientesRespondidos_header",
    gridId: "expedienteRespondidoGridId",
    titulo: "Expedientes respondidos nos últimos 10 dias",
  },


};
// essas duas variaveis existem apenas para notificar o usuario do progresso do plugin.
var tabelas = {};
// var total = [0];
var numeroDePaginas = undefined;
var startTime, endTime;

function start() {
  startTime = new Date();
}

function end() {
  endTime = new Date();
  var timeDiff = endTime - startTime; //in ms
  // strip the ms
  timeDiff /= 1000;

  // get seconds
  var seconds = Math.round(timeDiff);
  console.log(seconds + " seconds");
}

function replaceLast(find, replace, string) {
  const lastIndex = string.lastIndexOf(find);

  if (lastIndex === -1) {
    return string;
  }

  const beginString = string.substring(0, lastIndex);
  const endString = string.substring(lastIndex + find.length);

  return beginString + replace + endString;
}

function parseSliderScriptTag(gridId) {
  const grid = document.getElementById(gridId);
  const formSlider = grid.querySelector(".rich-inslider.rich-slider").parentNode;
  const scriptTag = formSlider.querySelector("script");
  console.debug(scriptTag.text);
  // x = scriptTag.text;
  // x = x.replace('//<![CDATA[\nnew Richfaces.Slider(\"', '');
  const retorno = {};
  let rest = scriptTag.text.split('//<![CDATA[\nnew Richfaces.Slider("')[1];
  retorno["tableId"] = rest.substring(0, rest.indexOf("'")); //confirmar valor
  // const formId = rest.substr(0, rest.indexOf("'"));
  rest = rest.substring(rest.indexOf('"') + 2);
  rest = rest.replace("//]]>", "").replaceAll("\\", "").replaceAll("'", '"');
  rest = replaceLast(")", "", rest);
  // console.info(rest);
  rest = rest.split('"similarityGroupingId":"')[1];
  return rest.substring(0, rest.indexOf('"')); // ex. de retorno: j_id379:j_id381
  // obj = JSON.parse(rest);
  // console.info(obj)

}

function parseSliderFormAction(gridId) {
  // gridId = 'expedientePendenteGridId'
  const grid = document.getElementById(gridId);
  const formSlider = grid.querySelector(
    ".rich-inslider.rich-slider"
  ).parentNode;
  const action = formSlider.action;
  let retorno = {};
  let rest = action.split("javascript:A4J.AJAX.SubmitForm('")[1];
  // const formId = rest.substr(0, rest.indexOf("'"));
  rest = rest.substr(rest.indexOf("'") + 2);
  rest = rest.replaceAll("%20", "").replace(")", "").replaceAll("'", '"');
  const obj = JSON.parse(rest);
  obj.parameter = JSON.stringify(obj.parameters)
    .replaceAll('"', "")
    .replace("{", "")
    .replace("}", "");
  retorno["ajaxRequest"] = obj.containerId;
  retorno["postUrl"] = obj.actionUrl;
  retorno["formId"] = obj.similarityGroupingId;
  // retorno['formId'] = obj.;
  // retorno['formId'] = obj.;
  console.debug(retorno);
  return retorno;
}
//"{\"similarityGroupingId\":\"j_id379\",\"actionUrl\":\"/primeirograu/Painel/painel_usuario/advogado.seam\",\"containerId\":\"j_id168\",\"parameters\":{\"j_id379\":\"j_id379\"}}"

function carregarPagina(gridId, numeroPagina) {
  const grid = document.getElementById(gridId);
  const formData = parseSliderFormAction(gridId);
  const viewStateId = document.getElementById("javax.faces.ViewState").value;
  const tabelaSlider = grid.querySelector(".rich-inslider.rich-slider");
  const formSlider = tabelaSlider.parentNode;
  //   console.info(tabelaSlider.id, formSlider);
  // nao consegui identificar o que esse id significa, mas eh necessario e apenas referenciado dentro da tag script
  const idMisterioso = parseSliderScriptTag(gridId);
  let urlParams = "AJAXREQUEST=" +
      formData.ajaxRequest +
      "&" +
      tabelaSlider.id +
      "=" +
      numeroPagina +
      "&" +
      formSlider.id +
      "=" +
      formSlider.id +
      "&autoScroll=&javax.faces.ViewState=" +
      viewStateId +
      "&" +
      idMisterioso +
      "=" +
      idMisterioso +
      "&AJAX%3AEVENTS_COUNT=1&";

  return fetch(window.location.href,
      {
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: "include",
        method: "POST",
        body: urlParams //"AJAXREQUEST=j_id168&j_id297:j_id298=23&j_id297=j_id297&autoScroll=&javax.faces.ViewState=j_id1&j_id297:j_id299=j_id297:j_id299&AJAX:EVENTS_COUNT=1&"
      })
      .then(function (response) {
        // The API call was successful!
        return response.text();
      }).then(function (html) {
    // Convert the HTML string into a document object
     const parser = new DOMParser();
     const doc = parser.parseFromString(html, 'text/html');

    return carregarTabela(gridId, numeroPagina, doc); //carregarTabela("expedientePendenteGridId", 23, doc);

  })
      .catch(function (err) {
    // There was an error
    console.warn('Something went wrong.', err);
  });
}
function alterarTextoLoading(novoTexto) {
  const loadingText = document.getElementById("loadingText");
  if (loadingText) {
    loadingText.innerText = novoTexto;
  }

}

function carregarTabela(gridId, numeroPagina, data) {
  alterarTextoLoading("Carregando página: " + (Object.keys(tabelas).length + 1) + " de " + numeroDePaginas);

  const paginaId = gridId + "List";

  const grid = data.getElementById(gridId);
  const totalPagina = grid.querySelectorAll("tr.rich-table-row").length;
  const tabela =  grid.querySelector("#" + paginaId).outerHTML;
  const retorno = {
    numeroPagina,
    tabela,
    totalPagina,
  }
  tabelas[numeroPagina] = tabela;
  console.info("Total de paginas: " + Object.keys(tabelas).length);
  console.info(retorno);
  return retorno;
}

function download(filename, textInput) {
  const element = document.createElement( 'a' );
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8, " + encodeURIComponent(textInput)
  );
  element.setAttribute("download", filename);
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function waitFor(conditionFunction) {
  const poll = (resolve) => {
    if (conditionFunction()) resolve();
    else setTimeout((_) => poll(resolve), 300);
  };

  return new Promise(poll);
}

function carregarDados(gridId, totalPaginas) {
  console.info(totalPaginas);
  const promises = [];
  // se tem apenas uma pagina, carrega a pagina que está na tela.
  if (totalPaginas == 1) {
    promises.push( Promise.resolve( carregarTabela(gridId, 1, document) ) );
  } else {
    for (let i = totalPaginas; i >= 1; i--) {
      promises.push( carregarPagina(gridId, i) );
    }
  }
  return Promise.all(promises);
}

function prepararEBaixarArquivo(titulo, tabelas) {
  console.info("gerando arquivo para download...");
  let quantidadeTotalTabelas = 0;
  let arquivoFinal = "";
  let comecoArquivo =
    "<html lang='pt-BR'><head><style>img { display: none;} table { width: 100% !important; }</style><title> Tabelas - " + titulo + "</title></head><body>";

  tabelas.sort((a, b) => (a.numeroPagina > b.numeroPagina) ? 1 : -1);
  tabelas.forEach((item, index) => {
    if (item) {
      quantidadeTotalTabelas += item.totalPagina;
      arquivoFinal += "<h3>Página: " + item.numeroPagina + "</h3>";
      arquivoFinal += item.tabela;
    }
  });

  arquivoFinal += "</body></html>";
  arquivoFinal =
    comecoArquivo +
    "<h2>" +
    titulo +
    " - Total: " +
    quantidadeTotalTabelas +
    ". Gerado em: " +
    new Date() +
    "</h2>" +
    arquivoFinal;
  console.info(arquivoFinal);

  download(titulo.replaceAll(" ", "_") + "_" + convertDate(new Date()) + ".html", arquivoFinal);
  reiniciarDadosGlobais();
}

function reiniciarDadosGlobais() {
  tabelas = {};
  // total = [0];
}

Object.entries(agrupadores).forEach(([key, dadosAgrupador]) => {
  console.log(key, dadosAgrupador); // "someKey" "some value", "hello" "world", "js javascript foreach object"
  const agrupadorId = dadosAgrupador[ 'agrupadorId' ]; //'agrPendentesCiencia_header';

  // const enclosingDiv = document.getElementById("tabProcAdvPainelIntimacaoDIV_");
  document.querySelector("#tabProcAdvPainelIntimacaoDIV_").addEventListener(
      "click",
      function ( event ) {
    // console.info(event)
        const agrupador = document.getElementById(agrupadorId);
        const agrupadorJaAberto = agrupador.getAttribute("aria-expanded") === 'true';
        console.info(event.target.id, agrupadorId)
        console.info(event.target.id.includes( agrupadorId ))
        // usando includes pq o clique pode ser no agrupador ou no seu label (que tem o id igual acrescido de _label)
        if( !event.target.id.includes( agrupadorId ) ) {
          return false;
        }

        // se o agrupador ja esta aberto e foi clicado, ele vai fechar e nao faz sentido tentar adicionar um botao.
        // so adicionamos o botao qdo o agrupador esta fechado no momento do clique, porque ele se abrirá e entao
        // poderemos adicionar o botao para o usuario ver.
        if ( agrupadorJaAberto ) {
          return false;
        }


        const id = dadosAgrupador["gridId"]; //"expedientePendenteGridId";
      console.info(id);
      waitFor((_) => document.getElementById(id) != null).then((_) => {
        console.info("Adicionando botao para baixar tabela no agrupador: " + dadosAgrupador['titulo'])
        // grid = document.getElementById(id);
        const button = document.createElement("input");
        button.classList.add("dr-tbpnl-tb-inact", "rich-tab-inactive")
        const table = document.getElementById(id + "List");
        button.type = "button";
        const idBotao = id + "baixarTabela"
        button.id = idBotao;
        button.value = "Baixar tabela";
        button.addEventListener(
            "click",
            (_) => configurarBotao(dadosAgrupador, id, table),
            false
        );
        console.info("idBotao =>" ,document.getElementById(idBotao));
        // se o botão já existe, não adicionamos um novo para não ficar 2 botões visíveis.
        if (!document.getElementById(idBotao)) {
          table.parentNode.insertBefore(button, table);
        }
      });
    },
    false
  );
});

function configurarBotao(dadosAgrupador, id, table) {
  start();
  const parser = new DOMParser();
  const loadingDiv = "<div class='loadingMask' id='loadingMask'><h1 id='loadingText'>Iniciando...</h1></div>"
  const wrapper = parser.parseFromString(loadingDiv, 'text/html').getElementById("loadingMask");
  console.info(wrapper)
  table.parentNode.insertBefore(wrapper, table);

  let totalPaginas = 1;

  const grid = document.getElementById(id);
  const tdTotalPaginas = grid && grid.querySelector(".rich-inslider-right-num");
  const totalPaginasTabela = tdTotalPaginas && tdTotalPaginas.textContent;
  totalPaginas = totalPaginasTabela || totalPaginas;
  console.info(totalPaginas, id);
  numeroDePaginas = totalPaginas
  carregarDados(id, totalPaginas)
      .then((tabelasPromise) => {
        console.info("Total no then:" + numeroDePaginas);
        console.info("tamanho tabelasPromise:" + tabelasPromise.length);
        console.info(tabelasPromise);
        alterarTextoLoading( "Preparando arquivo final para download..." );
        prepararEBaixarArquivo(dadosAgrupador["titulo"], tabelasPromise);
        setTimeout( (_) => document.getElementById("loadingMask").remove(), 500);
        end();
      });
}

function convertDate(inputFormat) {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  const d = new Date(inputFormat)
  return ['data',pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear(),'hora', pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join('_')
}
