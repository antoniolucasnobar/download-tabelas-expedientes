var agrupadores = {
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
var tabelas = {};
var total = [0];

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
  console.info(scriptTag.text);
  // x = scriptTag.text;
  // x = x.replace('//<![CDATA[\nnew Richfaces.Slider(\"', '');
  const retorno = {};
  let rest = scriptTag.text.split('//<![CDATA[\nnew Richfaces.Slider("')[1];
  retorno["tableId"] = rest.substring(0, rest.indexOf("'")); //confirmar valor
  // const formId = rest.substr(0, rest.indexOf("'"));
  rest = rest.substring(rest.indexOf('"') + 2);
  rest = rest.replace("//]]>", "").replaceAll("\\", "").replaceAll("'", '"');
  rest = replaceLast(")", "", rest);
  console.info(rest);
  rest = rest.split('"similarityGroupingId":"')[1];
  return rest.substring(0, rest.indexOf('"')); // ex. de retorno: j_id379:j_id381
  // obj = JSON.parse(rest);
  // console.info(obj)

  // obj.parameter = JSON.stringify(obj.parameters).replaceAll('"', '').replace('{', '').replace('}', '');
  // retorno['ajaxRequest'] = obj.containerId;
  // retorno['postUrl'] = obj.actionUrl;
  // retorno['formId'] = obj.similarityGroupingId;
  // // retorno['formId'] = obj.;
  // // retorno['formId'] = obj.;
  // console.info(retorno);
  // return retorno;
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
  console.info(retorno);
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
      formData.ajaxRequest.replace(':', "%3A") +
      "&" +
      tabelaSlider.id.replace(':', "%3A") +
      "=" +
      numeroPagina +
      "&" +
      formSlider.id.replace(':', "%3A") +
      "=" +
      formSlider.id.replace(':', "%3A") +
      "&autoScroll=&javax.faces.ViewState=" +
      viewStateId.replace(':', "%3A") +
      "&" +
      idMisterioso.replace(':', "%3A") +
      "=" +
      idMisterioso.replace(':', "%3A") +
      "&AJAX%3AEVENTS_COUNT=1&";
  console.info(urlParams);
  urlParams = decodeURIComponent( unescape( unescape(urlParams)));
  console.info(urlParams);

  jQuery.post(
      window.location.href, //"/primeirograu/Painel/painel_usuario/advogado.seam", // url
    urlParams
      , // data to be submit
    function (data, status, jqXHR) {
      // success callback
      //   console.info(data);
      carregarTabela(gridId, numeroPagina, data);

    }
  );
}

function carregarTabela(gridId, numeroPagina, data) {
  const paginaId = gridId + "List";
  const apenasRegistrosId = paginaId + ":tb";

  const elemento = data.getElementById( paginaId );
  const tbody = data.getElementById( apenasRegistrosId );
  total[numeroPagina] = jQuery(tbody).find("tr").length;
  console.info(total);
  let pagina = elemento.outerHTML;
  //   console.info(pagina);
  tabelas[numeroPagina] = pagina;
  //   console.info(tabelas);
  console.info("pagina: " + numeroPagina);
  console.info("Total de paginas: " + Object.keys(tabelas).length);
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
    else setTimeout((_) => poll(resolve), 1500);
  };

  return new Promise(poll);
}

function carregarDados(gridId, totalPaginas) {
  console.info(totalPaginas);
  // se tem apenas uma pagina, carrega a pagina que está na tela.
  if (totalPaginas == 1) {
    carregarTabela(gridId, 1, document);
  } else {
    for (let i = 1; i <= totalPaginas; i++) {
      carregarPagina(gridId, i);
    }
  }
}

function baixarArquivo(totalPaginas, titulo) {
  console.info("gerando arquivo para download...");
  let quantidadeTotalTabelas = 0;
  let arquivoFinal = "";
  let comecoArquivo =
    "<html><head><style>img { display: none;}</style></head><body>";

  for (let i = 1; i <= totalPaginas; i++) {
    quantidadeTotalTabelas += total[i];
    arquivoFinal += "<h3>Página: " + i + "</h3>";
    arquivoFinal += tabelas[i];
  }

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

  download(titulo.replaceAll(" ", "_") + ".html", arquivoFinal);
  tabelas = {};
  total = [0];
}

Object.entries(agrupadores).forEach(([key, dadosAgrupador]) => {
  var button = document.createElement("input"),
    br = document.createElement("br");
  console.log(key, dadosAgrupador); // "someKey" "some value", "hello" "world", "js javascript foreach object"
  var agrupadorId = dadosAgrupador["agrupadorId"]; //'agrPendentesCiencia_header';

  const agrupador = document.getElementById(agrupadorId);
  // se atualizar o jQuery, trocar bind por on
//   jQuery("#pageBody").bind(
//     "click",
//     "#" + agrupadorId,
//     function (e) {
//       const target = jQuery(e.target);
//       console.info(target);
//       console.info("targetId", target[0].id);
//       if (target[0].id != agrupadorId) {
//         return;
//       }
      //     // se o clique foi direcionado a um botão, não tem porque também clicar na linha.
      //     if (target.is('i') || target.is('button') || target.is('a') || target.hasClass('select-checkbox')) {
      //         return;
      //     }
      //     alert("clicou!");
      //   });

        agrupador.addEventListener(
      "click",
      function () {
      const id = dadosAgrupador["gridId"]; //"expedientePendenteGridId";
      console.info(id);
      waitFor((_) => document.getElementById(id) != null).then((_) => {
        // grid = document.getElementById(id);
        table = document.getElementById(id + "List");
        button.type = "button";
        button.value = "Baixar tabela";
        button.addEventListener(
          "click",
          function (e) {
            let totalPaginas = 1;
            waitFor((_) => document.getElementById(id) != null)
              .then((_) => {
                grid = document.getElementById(id);
                const tdTotalPaginas = jQuery(grid).find(
                  ".rich-inslider-right-num"
                );
                const totalPaginasTabela = jQuery(tdTotalPaginas).html();
                totalPaginas = totalPaginasTabela
                  ? totalPaginasTabela
                  : totalPaginas;
                console.info(totalPaginas, id);
                carregarDados(id, totalPaginas);
                return totalPaginas;
              })
              .then((numeroPaginas) => {
                console.info("Total no then:" + numeroPaginas);
                waitFor((_) => jaAcabou(numeroPaginas)).then((_) =>
                  baixarArquivo(numeroPaginas, dadosAgrupador["titulo"])
                );
              });

            // console.info(tabelas);

            // console.info(
            //   "Todas páginas carregadas! " + Object.keys(tabelas).length
            // );
          },
          false
        );

        table.parentNode.insertBefore(button, table);
      });
    },
    false
  );
});

function jaAcabou(numeroPaginas) {
  console.info("ja Acabou?");
  console.info(Object.keys(tabelas).length, numeroPaginas);
  return Object.keys(tabelas).length == numeroPaginas;
}
