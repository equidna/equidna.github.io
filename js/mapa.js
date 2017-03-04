$(function() {

    /////////////////////////////////
    // criar os gráficos sem dados //
    /////////////////////////////////

    var opcoes_grafico = {
        scales: {
            xAxes: [{
                type: 'linear',
                position: 'bottom'
            }]
        }
    }

    // para a distância
    var distancia = $("#distancia");
    var grafico_distancia = new Chart(distancia, {
        type: "line",
        options: opcoes_grafico
    });


    // para velocidade
    var velocidade = $("#velocidade");
    var grafico_velocidade = new Chart(velocidade, {
        type: 'line',
        options: opcoes_grafico
    });

    // para aceleração
    var aceleracao = $("#aceleracao");
    var grafico_aceleracao = new Chart(aceleracao, {
        type: 'line',
        options: opcoes_grafico
    });

    // para calorias
    var calorias = $("#calorias");
    var grafico_calorias = new Chart(calorias, {
        type: 'line',
        options: opcoes_grafico
    });

    // para altitude
    var altitude = $("#altitude");
    var grafico_altitude = new Chart(altitude, {
        type: 'line',
        options: opcoes_grafico
    });

    // para subida acumulada
    var subida = $("#subida");
    var grafico_subida = new Chart(subida, {
        type: 'line',
        options: opcoes_grafico
    });

    // para descida acumulada
    var descida = $("#descida");
    var grafico_descida = new Chart(descida, {
        type: 'line',
        options: opcoes_grafico
    });

    // para diferença de altitude
    var diferenca = $("#diferenca");
    var grafico_diferenca = new Chart(diferenca, {
        type: 'line',
        options: opcoes_grafico
    });


    ////////////////////////////////////
    // criar o mapa e o overlay popup //
    ////////////////////////////////////

    // Popup overlay
    var popup = new ol.Overlay.Popup({
        popupClass: "default", //"tooltips", "warning" "black" "default", "tips", "shadow",
        closeBox: true,
        positioning: 'auto',
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    });

    // componente principal do openlayers, cria o mapa
    var mapa = new ol.Map({
        // define camadas para o mapa
        layers: [
            // define a camada do mosaico
            new ol.layer.Tile({
                // define a fonte da camada do mosaico como o OpenStreetMap
                source: new ol.source.OSM()
            })
        ],
        // evoca automaticamente o mapa na div de id "map"
        target: "mapa",
        // define a vista do mapa
        view: new ol.View({
            // define o centro da vista
            center: [0, 0],
            // define o zoom da vista
            zoom: 2
        }),
        overlays: [popup]
    });

    // adicionar controlo de seleção aos pontos e linhas do mapa
    var selecao = new ol.interaction.Select({});
    mapa.addInteraction(selecao);

    // ao selecionar o ponto
    selecao.getFeatures().on(["add"], function(e) {
        // se o id não for o da linha (undifined)
        if (Array.isArray(e.element.id_)) {
            var id = e.element.id_;
            var cor = id[0];
            var index = id[1];
            //console.log(id);

            // obter dados do ponto
            var conteudo = "";
            //var dados_ponto = {};
            for (var i = 0; i < dimensoes.length; i++) {
                var dimensao = dimensoes[i];
                conteudo += "<b>" + dimensao + ":</b> "
                conteudo += dados[cor][dimensao][index];
                conteudo += " " + unidades[i] + "<br>";
            }
            //console.log(conteudo);
            popup.show(e.element.getGeometry().getCoordinates(), conteudo);
        }
    });

    selecao.getFeatures().on(["remove"], function(e) {
        popup.hide();
    });


    //////////////////////////////////////////
    // criar os layers e os estilos do mapa //
    //////////////////////////////////////////

    // para criar um layer com features (pontos e linhas de percurso)
    var nome_layer = {};
    var criarLayer = function(cor) {

        // criar um layer vazio
        var layer = new ol.layer.Vector({
            source: new ol.source.Vector({})
        });
        nome_layer[cor] = layer; // associar o apontador do layer à cor

        // criar estilo dos pontos dependendo da cor
        var estilo = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                snapToPixel: false,
                fill: new ol.style.Fill({
                    color: traducaoCores[cor]
                }),
                stroke: new ol.style.Stroke({
                    color: "black",
                    width: 3
                })
            })
        });

        // para o estilo das linhas entre pontos do mapa
        var estiloLinha = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: "grey",
                width: 5
            })
        });

        // adicionar estilo aos pontos e à linha
        layer.setStyle([estilo, estiloLinha]);
    }


    //////////////////////////////////////////////////
    // funções para lidar com os dados dos gráficos //
    //////////////////////////////////////////////////

    // inicializar array onde vão ser guardadas cores utilizadas nos gráficos
    var cores_graficos = {};
    var dimensoes_graficos = ["distância", "velocidade", "aceleração",
        "calorias", "altitude", "subida acumulada", "descida acumulada",
        "diferença altitude"];
    for (var i = 0; i < dimensoes_graficos.length; i++) {
        cores_graficos[dimensoes_graficos[i]] = [];
    }
    //console.log(cores_graficos);
    var definirDatasets = function(dimensao) {
        // reset ao array onde vão ser guardadas cores utilizadas na dimensão do gráfico
        cores_graficos[dimensao] = [];

        //console.log(cores);
        var datasets = [];
        for (var i = 0; i < cores.length; i++) {
            var cor = cores[i];
            var cor_ingles = cores_ingles[i];
            var dados_tempo = dados[cor]["tempo relativo"];
            var dados_dimensao = dados[cor][dimensao];

            if (dados_dimensao.length != 0) {

                // guardar cores utilizadas nos gráficos
                cores_graficos[dimensao].push(cor);
                //console.log(cores_graficos);

                //console.log(cor);
                //console.log(dimensao);
                //console.log(dados_tempo);
                //console.log(dados_dimensao);
                var dataset = {};
                dataset["label"] = dimensao;
                dataset["borderColor"] = cor_ingles;
                //console.log(dataset);
                var dados_dataset = [];
                for (var j = 0; j < dados_tempo.length; j++) {
                    var ponto_dados = {};
                    ponto_dados["x"] = dados_tempo[j] / 1000;
                    ponto_dados["y"] = dados_dimensao[j];
                    dados_dataset.push(ponto_dados);
                }
                dataset["data"] = dados_dataset;
                datasets.push(dataset);
                //console.log(datasets);
            }

        }
        return datasets;
    }

    // função para preencher os gráficos
    var preencherGraficos = function() {
        // limpar gráficos
        grafico_distancia.destroy();
        grafico_velocidade.destroy();
        grafico_aceleracao.destroy();
        grafico_calorias.destroy();
        grafico_altitude.destroy();
        grafico_subida.destroy();
        grafico_descida.destroy();
        grafico_diferenca.destroy();

        // definir datasets
        var distancia_dataset = definirDatasets("distância");
        var velocidade_dataset = definirDatasets("velocidade");
        var aceleracao_dataset = definirDatasets("aceleração");
        var calorias_dataset = definirDatasets("calorias");
        var altitude_dataset = definirDatasets("altitude");
        var subida_dataset = definirDatasets("subida acumulada");
        var descida_dataset = definirDatasets("descida acumulada");
        var diferenca_dataset = definirDatasets("diferença altitude");
        //console.log(distancia_dataset);

        // reinicializar os gráficos
        distancia = $("#distancia");
        grafico_distancia = new Chart(distancia, {
            data: {
                datasets: distancia_dataset
            },
            type: 'line',
            options: opcoes_grafico
        });

        velocidade = $("#velocidade");
        grafico_velocidade = new Chart(velocidade, {
            data: {
                datasets: velocidade_dataset
            },
            type: 'line',
            options: opcoes_grafico
        });

        aceleracao = $("#aceleracao");
        grafico_aceleracao = new Chart(aceleracao, {
            data: {
                datasets: aceleracao_dataset
            },
            type: 'line',
            options: opcoes_grafico
        });

        calorias = $("#calorias");
        grafico_calorias = new Chart(calorias, {
            data: {
                datasets: calorias_dataset
            },
            type: 'line',
            options: opcoes_grafico
        });

        altitude = $("#altitude");
        grafico_altitude = new Chart(altitude, {
            data: {
                datasets: altitude_dataset
            },
            type: 'line',
            options: opcoes_grafico
        });

        subida = $("#subida");
        grafico_subida = new Chart(subida, {
            data: {
                datasets: subida_dataset
            },
            type: 'line',
            options: opcoes_grafico
        });

        descida = $("#descida");
        grafico_descida = new Chart(descida, {
            data: {
                datasets: descida_dataset
            },
            type: 'line',
            options: opcoes_grafico
        });

        diferenca = $("#diferenca");
        grafico_diferenca = new Chart(diferenca, {
            data: {
                datasets: diferenca_dataset
            },
            type: 'line',
            options: opcoes_grafico
        });
    }


    // função para limpar dados dos gráficos
    // inicializar index dos datasets
    var index_visualizar = 0;
    var resetGraficos = function() {
        //console.log(grafico_distancia.data.datasets.length);

        // remover dados dos datasets
        for (var i = 0; i < grafico_distancia.data.datasets.length; i++)
            grafico_distancia.data.datasets[i].data = [];
        for (var i = 0; i < grafico_velocidade.data.datasets.length; i++)
            grafico_velocidade.data.datasets[i].data = [];
        for (var i = 0; i < grafico_aceleracao.data.datasets.length; i++)
            grafico_aceleracao.data.datasets[i].data = [];
        for (var i = 0; i < grafico_calorias.data.datasets.length; i++)
            grafico_calorias.data.datasets[i].data = [];
        for (var i = 0; i < grafico_altitude.data.datasets.length; i++)
            grafico_altitude.data.datasets[i].data = [];
        for (var i = 0; i < grafico_subida.data.datasets.length; i++)
            grafico_subida.data.datasets[i].data = [];
        for (var i = 0; i < grafico_descida.data.datasets.length; i++)
            grafico_descida.data.datasets[i].data = [];
        for (var i = 0; i < grafico_diferenca.data.datasets.length; i++)
            grafico_diferenca.data.datasets[i].data = [];
        grafico_distancia.update();
        grafico_velocidade.update();
        grafico_aceleracao.update();
        grafico_calorias.update();
        grafico_altitude.update();
        grafico_subida.update();
        grafico_descida.update();
        grafico_diferenca.update();
    }

    // função para incrementar valores de todos os gráficos
    var incrementarGraficos = function(cor) {
        incrementarGrafico(cor, grafico_distancia, "distância");
        incrementarGrafico(cor, grafico_velocidade, "velocidade");
        incrementarGrafico(cor, grafico_aceleracao, "aceleração");
        incrementarGrafico(cor, grafico_calorias, "calorias");
        incrementarGrafico(cor, grafico_altitude, "altitude");
        incrementarGrafico(cor, grafico_subida, "subida acumulada");
        incrementarGrafico(cor, grafico_descida, "descida acumulada");
        incrementarGrafico(cor, grafico_diferenca, "diferença altitude");
    }

    // função para incrementar valores de cada gráfico
    var incrementarGrafico = function(cor, dimensao_grafico, dimensao) {
        // obter dataset
        var dimensao_dataset = dados[cor][dimensao];
        //console.log(dimensao_dataset);

        // se dimensão existir
        //console.log(dimensao);
        //console.log(dimensao_dataset.length);
        if (dimensao_dataset.length != 0) {
            // obter último id da feature
            var ultimo_id = idUltimaFeature(cor);
            //console.log(ultimo_id);

            // obter tempo
            var dados_tempo = dados[cor]["tempo relativo"];

            // obter index da cor a partir do array das cores utilizadas nos gráficos
            var index_cor = cores_graficos[dimensao].indexOf(cor);
            //console.log(cores_graficos);
            //console.log(cor);
            //console.log(index_cor);

            // adicionar um valor aos datasets
            var ponto_dados = {};
            ponto_dados["x"] = dados_tempo[ultimo_id] / 1000;
            ponto_dados["y"] = dimensao_dataset[ultimo_id];
            //console.log(dimensao_dataset);
            dimensao_grafico.data.datasets[index_cor].data.push(ponto_dados);
            //console.log(dimensao_grafico.data.datasets[index_cor].data);
            //console.log(dimensao_grafico.data.datasets);

            dimensao_grafico.update();
        }
    }


    // preencher o layer criado com os dados da respetiva cor
    var feature_linha = {};
    var preencherLayer = function(cor) {
        // obter coordenadas (formato ESPG: 4326)
        var latitudes = dados[cor]["latitude"];
        var longitudes = dados[cor]["longitude"];
        //console.log(latitude);
        //console.log(longitude);

        // converter coordenadas para formato EPSG:3857
        // e guardá-las, ponto a ponto, no layer
        var coordenadas = [];
        for (var i = 0; i < latitudes.length; i++) {
            var coordenada = ol.proj.transform([longitudes[i], latitudes[i]], "EPSG:4326", "EPSG:3857");
            ultima_coordenada[cor] = coordenada;
            coordenadas.push(coordenada);

            // criar uma feature
            var feature = new ol.Feature({
                geometry: new ol.geom.Point(coordenada),
            });

            // identificar a feature do ponto pela cor e index do array
            feature.setId([cor, i]);
            // adicionar feature à source do ponto
            nome_layer[cor].getSource().addFeature(feature);
        }

        // converter coordenadas numa linha
        var linhas = new ol.geom.LineString(coordenadas);
        // criar feature da linha
        feature_linha[cor] = new ol.Feature(linhas);
        //console.log(feature_linha[cor]);
        // adicionar feature da linha
        nome_layer[cor].getSource().addFeature(feature_linha[cor]);
    }

    // obter o id da feature do último ponto
    var idUltimaFeature = function(cor) {
        var features = nome_layer[cor].getSource().getFeatures();
        var max_id = -1;
        $.grep(features, function(feature) {
            //console.log(feature.id_);
            if (Array.isArray(feature.id_)) var id = feature.id_[1];
            if (max_id < id) max_id = id;
        });
        //console.log(max_id);
        return max_id;
    }

    // incrementar um ponto ao layer e redesenhar a linha de percurso
    var incrementarLayer = function(cor) {
        //console.log(cor);
        var ultimo_id = idUltimaFeature(cor);
        ultimo_id++;
        // se chegar ao fim do array parar incrementação
        if (ultimo_id < dados[cor]["latitude"].length) {
            //console.log(ultimo_id);

            // acrescentar ponto seguinte
            // obter coordenadas (formato ESPG: 4326)
            var latitude = dados[cor]["latitude"][ultimo_id];
            var longitude = dados[cor]["longitude"][ultimo_id];

            var coordenada = ol.proj.transform([longitude, latitude], "EPSG:4326", "EPSG:3857");
            ultima_coordenada[cor] = coordenada;

            // criar uma feature
            var feature = new ol.Feature({
                geometry: new ol.geom.Point(coordenada),
            });

            // colocar vista no novo ponto se cor de visualização estiver selecionada
            if(cor == cores_layer[index_visualizar]) {
                centrarMapa(coordenada);
            }

            // identificar a feature do ponto pela cor e index do array
            feature.setId([cor, ultimo_id]);
            // adicionar feature à source do ponto
            nome_layer[cor].getSource().addFeature(feature);


            // redesenhar linha de caminho
            var latitudes = dados[cor]["latitude"].slice(0, ultimo_id + 1);
            var longitudes = dados[cor]["longitude"].slice(0, ultimo_id + 1);

            // caso tenha mais de 2 pontos, gerar linha
            if (latitudes.length > 0) {
                //console.log(latitudes.length);
                //console.log(feature_linha[cor]);
                var coordenadas = [];
                for (var i = 0; i < latitudes.length; i++) {
                    var coordenada = ol.proj.transform([longitudes[i], latitudes[i]], "EPSG:4326", "EPSG:3857");
                    coordenadas.push(coordenada);
                }

                // converter coordenadas numa linha
                var linhas = new ol.geom.LineString(coordenadas);

                // remover feature linha antiga se existir
                //console.log(latitudes.length + " - " + cor);
                if (latitudes.length > 1) {
                    nome_layer[cor].getSource().removeFeature(feature_linha[cor]);
                }

                // criar nova feature da linha
                feature_linha[cor] = new ol.Feature(linhas);
                // adicionar feature da linha
                nome_layer[cor].getSource().addFeature(feature_linha[cor]);
            }
        }
    }

    // função para centrar o mapa
    var centrarMapa = function(coordenada) {
        //console.log(coordenada);
        if (coordenada != null) {
            var pan = ol.animation.pan({
                duration: 500,
                source: mapa.getView().getCenter()
            });
            mapa.beforeRender(pan);
            mapa.getView().setCenter(coordenada);
        }
    }


    /////////////////////////////////////////////////
    // lidar para mostrar o percurso em tempo real //
    /////////////////////////////////////////////////

    var timer = {};
    $("#reproduzir").click(function() {
        // limpar dados dos gráficos
        resetGraficos();

        // para cada cor
        for (var i = 0; i < cores.length; i++) {
            var cor = cores[i];
            // se existir o layer da cor
            if (nome_layer[cor]) {
                // limpar os pontos e linha da source da respetiva cor
                nome_layer[cor].getSource().clear();

                // incrementar primeiro ponto de cada layer
                incrementarLayer(cor);

                // incrementar primeiro ponto dos gráficos
                incrementarGraficos(cor);
            }
        }

        // obter o tempo inicial
        var tempo_inicio = new Date().getTime();
        //console.log(tempo_inicio);

        // para o timer se estiver a correr
        clearInterval(timer);
        // iniciar indexes dos dados
        var index = {};
        for (var i = 0; i < cores.length; i++) {
            var cor = cores[i];
            index[cor] = 1;
        }
        // iniciar o timer
        timer = setInterval(function() {
            // para cada cor
            for (var i = 0; i < cores.length; i++) {
                var cor = cores[i];
                //console.log(cor);
                //console.log(dados[cor]["tempo relativo"]);

                // se o tempo decorrido é maior que o tempo relativo dos dados
                var tempo_atual = new Date().getTime();
                if (tempo_atual - tempo_inicio > dados[cor]["tempo relativo"][index[cor]]) {
                    // incrementar o index
                    index[cor]++;

                    // se existir o layer da cor
                    if (nome_layer[cor]) {
                        // incrementar primeiro ponto de cada layer
                        incrementarLayer(cor);

                        // incrementar gráficos
                        incrementarGraficos(cor);
                    }
                }
            }
            // verificar diferença de tempo de 1 em 1 segundo para todas as cores
        }, 1000);
    });


    ////////////////////////////////////////
    // lidar para mostrar todo o percurso //
    ////////////////////////////////////////

    $("#completo").click(function() {
        // para cada cor
        for (var i = 0; i < cores.length; i++) {
            var cor = cores[i];
            // se existir o layer da cor
            if (nome_layer[cor]) {
                // para o timer se estiver a correr
                clearInterval(timer);

                // limpar os pontos e linha da source da respetiva cor
                nome_layer[cor].getSource().clear();
                // obter novamente os pontos e linha da source
                preencherLayer(cor);
            }
        }

        // obter conteúdo dos gráficos
        preencherGraficos();

        // centrar vista na última posição apresentada no percurso selecionado
        //console.log(cores[index_visualizar]);
        var coordenada = ultima_coordenada[cores[index_visualizar]];
        //console.log(coordenada);
        centrarMapa(coordenada);
    });


    ////////////////////////////////////////////////
    // lidar alternar a vista entre cada percurso //
    ////////////////////////////////////////////////

    var index_visualizar = -1;
    var ultima_coordenada = {};
    $("#seguinte").click(function() {
        index_visualizar++;

        if (index_visualizar >= cores_layer.length) {
            index_visualizar = 0;
        }

        // centrar vista na última posição apresentada no percurso selecionado
        //console.log(cores[index_visualizar]);
        var coordenada = ultima_coordenada[cores_layer[index_visualizar]];
        //console.log(coordenada);
        centrarMapa(coordenada);
    });


    //////////////////////////////////////////////////////////
    // lidar com o desbloqueio da vista entre cada percurso //
    //////////////////////////////////////////////////////////

    $("#libertar").click(function() {
        index_visualizar = -1;
    });


    /////////////////////////////
    // obter dados do ficheiro //
    /////////////////////////////

    // função para inicializar objeto onde serão armazenados dos dados
    var cores = ["vermelho", "verde", "azul", "amarelo", "laranja"];
    var dimensoes = ["latitude", "longitude", "altitude", "tempo",
        "tempo relativo", "tempo instantâneo", "distância", "velocidade",
        "aceleração", "calorias", "subida acumulada", "descida acumulada",
        "diferença altitude"];
    var unidades = ["", "", "m", "", "ms", "s", "Km", "Km/h", "m/s²", "Kcal",
        "m", "m", "m"];
    var dados = {};
    var setDados = function() {
        for (var i = 0; i < cores.length; i++) {
            var cor = cores[i];
            dados[cor] = {};
            for (var j = 0; j < dimensoes.length; j++) {
                var dimensao = dimensoes[j];
                dados[cor][dimensao] = [];
            }
        }
    }
    setDados();
    // associar nomes das cores em português e inglês
    var cores_ingles = ["red", "green", "blue", "yellow", "orange"];
    var traducaoCores = {};
    for (var i = 0; i < cores.length; i++) {
        cor = cores[i];
        traducaoCores[cor] = cores_ingles[i];
    }

    // funcção para fazer reset aos dados (dimensões) de um dos ficheiros (cores)
    var resetDados = function(cor) {
        for (var i = 0; i < dimensoes.length; i++) {
            var dimensao = dimensoes[i];
            dados[cor][dimensao] = [];
        }
    }

    // função para carregar o ficheiro
    // inicializar array de cores usadas no mapa
    var cores_layer = [];
    var carregarFicheiro = function(ficheiros, cor) {
        // usar o primeiro ficheiro da lista
        var ficheiro = ficheiros[0];

        // validar se ficheiro é GPX e se tamanho é menor ou igual a 10Mb
        var bytes_ficheiro = ficheiro.size;
        var extensao = ficheiro.name.split('.').pop();
        //console.log(bytes_ficheiro);
        //console.log(extensao);
        if (bytes_ficheiro > 10000000 || extensao.toLowerCase() != "gpx") {
            $("#modal").modal("show");
        } else {
            // reset à estrutura onde serão guardados os dados do ficheiro
            resetDados(cor);

            var leitor = new FileReader();
            // Obter os dados do ficheiro no fim da sua leitura
            leitor.onload = (function() {
                return function(e) {
                    var gpx = e.target.result;

                    var ponto_dados = $(gpx).find("trkpt,rtept,wpt");
                    ponto_dados.each(function() {
                        var latitude = parseFloat($(this).attr("lat"));
                        dados[cor]["latitude"].push(latitude);
                        var longitude = parseFloat($(this).attr("lon"));
                        dados[cor]["longitude"].push(longitude);
                    });
                    ponto_dados.find("ele").each(function() {
                        var altitude = parseFloat($(this).text());
                        dados[cor]["altitude"].push(altitude);
                    });
                    ponto_dados.find("time").each(function() {
                        var tempo = $(this).text();
                        dados[cor]["tempo"].push(tempo);
                    });

                    if (dados[cor]["latitude"].length != dados[cor]["tempo"].length) {
                        $("#modal").modal("show");
                    }
                    //console.log(dados);

                    // obter tempo relativo dos ficheiros
                    var tempos = dados[cor]["tempo"];
                    var padding = new Date(tempos[0]).getTime();
                    dados[cor]["tempo relativo"][0] = 0;
                    for (var i = 1; i < tempos.length; i++) {
                        var tempo = tempos[i];
                        //console.log(tempo);
                        var tempo_formatado = new Date(tempo);
                        var tempo_mili = tempo_formatado.getTime();
                        //console.log(tempo_mili + "-" + padding);
                        dados[cor]["tempo relativo"][i] = tempo_mili - padding;
                    }
                    //console.log(dados);

                    // obter tempos instantâneos
                    var tempos_relativos = dados[cor]["tempo relativo"];
                    dados[cor]["tempo instantâneo"][0] = 0;
                    for (var i = 1; i < tempos_relativos.length; i++) {
                        var tempo_relativo = tempos_relativos[i];
                        var tempo_anterior = tempos_relativos[i - 1];
                        dados[cor]["tempo instantâneo"][i] = (tempo_relativo - tempo_anterior) / 1000;
                    }
                    //console.log(dados);

                    // obter distância percorrida
                    var latitudes = dados[cor]["latitude"];
                    var longitudes = dados[cor]["longitude"];
                    dados[cor]["distância"][0] = 0;
                    for (var i = 1; i < latitudes.length; i++) {
                        var latitude_1 = latitudes[i - 1];
                        var latitude_2 = latitudes[i];
                        var longitude_1 = longitudes[i - 1];
                        var longitude_2 = longitudes[i];
                        //console.log(latitude + " - " + longitude);

                        // converter latitude e longitude em distância
                        var R = 6371e3; // em metros
                        var φ1 = latitude_1 * Math.PI / 180;
                        var φ2 = latitude_2 * Math.PI / 180;;

                        var Δφ = (latitude_2 - latitude_1) * Math.PI / 180;
                        var Δλ = (longitude_2 - longitude_1) * Math.PI / 180;

                        var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                                Math.cos(φ1) * Math.cos(φ2) *
                                Math.sin(Δλ/2) * Math.sin(Δλ/2);
                        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

                        var metros = R * c;
                        //console.log(metros);

                        // converter metros em kms
                        var kms = metros / 1000;

                        // guardar kms acumulados
                        dados[cor]["distância"][i] = dados[cor]["distância"][i - 1] + kms;
                    }
                    //console.log(dados);

                    // obter velocidade
                    var tempos = dados[cor]["tempo instantâneo"];
                    var distancias = dados[cor]["distância"];
                    dados[cor]["velocidade"][0] = 0;
                    for (var i = 1; i < tempos.length; i++) {
                        var Δt = tempos[i];
                        var distancia_1 = distancias[i - 1];
                        var distancia_2 = distancias[i];

                        var Δd = distancia_2 - distancia_1;
                        var velocidade = Δd / (Δt / 3600);

                        dados[cor]["velocidade"][i] = velocidade;
                    }
                    //console.log(dados);

                    // obter acelerações
                    var tempos = dados[cor]["tempo instantâneo"];
                    var velocidades = dados[cor]["velocidade"];
                    dados[cor]["aceleração"][0] = 0;
                    for (var i = 1; i < tempos.length; i++) {
                        var Δt = tempos[i];
                        var velocidade_1 = velocidades[i - 1];
                        var velocidade_2 = velocidades[i];

                        var Δv = velocidade_2 - velocidade_1;
                        var aceleracao = (Δv * 1000 / 3600) / Δt;
                        //console.log(Δt + " " + Δv);
                        //console.log(aceleracao);

                        dados[cor]["aceleração"][i] = aceleracao;
                    }
                    //console.log(dados);

                    // obter calorias acumuladas
                    var tempos = dados[cor]["tempo instantâneo"];
                    var velocidades = dados[cor]["velocidade"];
                    dados[cor]["calorias"][0] = 0;
                    for (var i = 1; i < tempos.length; i++) {
                        var Δt = tempos[i];
                        var velocidade = velocidades[i];

                        //converter velocidade em mets
                        if (velocidade >= 6.5 && velocidade <= 8) {
                            var mets = 6;
                        } else if (velocidade > 8 && velocidade <= 8.5) {
                            var mets = 8.3;
                        } else if (velocidade > 8.5 && velocidade <= 9.5) {
                            var mets = 9;
                        } else if (velocidade > 9.5 && velocidade <= 10.5) {
                            var mets = 9.8;
                        } else if (velocidade > 10.5 && velocidade <= 11) {
                            var mets = 10.5;
                        } else if (velocidade > 11 && velocidade <= 12) {
                            var mets = 11;
                        } else if (velocidade > 12 && velocidade <= 14) {
                            var mets = 11.8;
                        } else if (velocidade > 14 && velocidade <= 14.5) {
                            var mets = 12.3;
                        } else if (velocidade > 14.5 && velocidade <= 16) {
                            var mets = 12.8;
                        } else if (velocidade > 16 && velocidade <= 17.5) {
                            var mets = 14.5;
                        } else if (velocidade > 17.5 && velocidade <= 19) {
                            var mets = 16;
                        } else if (velocidade > 19 && velocidade <= 21) {
                            var mets = 19;
                        } else if (velocidade > 21 && velocidade <= 22.5) {
                            var mets = 19.8;
                        } else if (velocidade > 22.5) {
                            var mets = 23;
                        } else {
                            var mets = 0;
                        }

                        var peso_medio = 80;
                        var calorias = mets * peso_medio * Δt / 3600;
                        dados[cor]["calorias"][i] = dados[cor]["calorias"][i - 1] + calorias
                    }

                    // obter altitudes
                    var altitudes = dados[cor]["altitude"];
                    //console.log(altitudes);
                    if (altitudes.length != 0) {
                        dados[cor]["subida acumulada"][0] = 0;
                        dados[cor]["descida acumulada"][0] = 0;
                        dados[cor]["diferença altitude"][0] = 0;
                        for (var i = 1; i < altitudes.length; i++) {
                            var altitude_1 = altitudes[i - 1];
                            var altitude_2 = altitudes[i];

                            var Δh = altitude_2 - altitude_1;
                            if (Δh > 0) {
                                var subida = Δh;
                                var descida = 0;
                            } else {
                                var subida = 0;
                                var descida = -Δh;
                            }
                            dados[cor]["subida acumulada"][i] = dados[cor]["subida acumulada"][i - 1] + subida;
                            dados[cor]["descida acumulada"][i] = dados[cor]["descida acumulada"][i - 1] + descida;
                            dados[cor]["diferença altitude"][i] = dados[cor]["diferença altitude"][i - 1] + Δh;
                        }
                    }
                    else {
                      dados[cor]["altitude"] = [];
                      dados[cor]["subida acumulada"] = [];
                      dados[cor]["descida acumulada"] = [];
                      dados[cor]["diferença altitude"] = [];
                    }

                    // remover camada do mapa
                    mapa.removeLayer(nome_layer[cor]);
                    // criar layer com os dados da respetiva cor
                    criarLayer(cor);
                    // preencher layer com os pontos de coordenadas e a linha de percurso
                    preencherLayer(cor);
                    // adicionar layer ao mapa
                    mapa.addLayer(nome_layer[cor]);

                    // preencher gráficos
                    preencherGraficos();

                    // ativar como visto a checkbox da cor correspondente
                    var seletor = "#" + cor;
                    $(seletor).prop("checked", true);

                    // adicionar cor ao array de cores utilizadas no layer
                    if (!cores_layer.includes(cor)) cores_layer.push(cor);
                };
            })(ficheiro);
            // Read in the image file as a data URL.
            leitor.readAsText(ficheiro);
        }
    };


    /////////////////////////////////////////
    // lidar com a visibilidade dos layers //
    /////////////////////////////////////////

    // função para tornar layer visível/invisível
    var alternarVisibilidade = function(cor) {
        if ($("#" + cor).is(":checked") && nome_layer[cor]) {
            //console.log("mostrar");
            nome_layer[cor].setVisible(true);

            // adicionar cor ao array de cores utilizadas nos layers visiveis
            if (!cores_layer.includes(cor)) cores_layer.push(cor);
            //console.log(cores_layer);
        } else if (nome_layer[cor]) {
            //console.log("esconder");
            nome_layer[cor].setVisible(false);

            // remover cor ao array de cores utilizadas nos layers visiveis
            var index = cores_layer.indexOf(cor);
            if (index > -1) cores_layer.splice(index, 1);
            //console.log(cores_layer);
        }
    }

    $("#vermelho").click(function() {
        cor = "vermelho";
        alternarVisibilidade(cor);
    });

    $("#verde").click(function() {
        cor = "verde";
        alternarVisibilidade(cor);
    });

    $("#azul").click(function() {
        cor = "azul";
        alternarVisibilidade(cor);
    });

    $("#amarelo").click(function() {
        cor = "amarelo";
        alternarVisibilidade(cor);
    });

    $("#laranja").click(function() {
        cor = "laranja";
        alternarVisibilidade(cor);
    });


    ///////////////////////////////////////////////
    // lidar com o carregamento de ficheiros GPX //
    ///////////////////////////////////////////////

    // evocar a função carregar ficheiro para obter os dados gpx da respetiva cor
    $("#ficheiro-vermelho").change(function() {
        var ficheiros = $("#ficheiro-vermelho").prop("files");
        carregarFicheiro(ficheiros, "vermelho");
    });
    $("#ficheiro-verde").change(function() {
        var ficheiros = $("#ficheiro-verde").prop("files");
        carregarFicheiro(ficheiros, "verde");
    });
    $("#ficheiro-azul").change(function() {
        var ficheiros = $("#ficheiro-azul").prop("files");
        carregarFicheiro(ficheiros, "azul");
    });
    $("#ficheiro-amarelo").change(function() {
        var ficheiros = $("#ficheiro-amarelo").prop("files");
        carregarFicheiro(ficheiros, "amarelo");
    });
    $("#ficheiro-laranja").change(function() {
        var ficheiros = $("#ficheiro-laranja").prop("files");
        carregarFicheiro(ficheiros, "laranja");
    });


    /////////////////////////
    // lidar com tabulação //
    /////////////////////////

    $(function() {
        //$("#tabs").tabs();
        $("#tabs").tabs({heightStyle: "content"});
    });


    //////////////////////////////////////////
    // lidar com exportação de conteúdo CSV //
    //////////////////////////////////////////

    $("#gerar-csv").click(function() {
        //console.log(dados);

        var string_csv = "\"cor\";\"dimensão\";\"valor\";\"unidade\";\"index\"\n";
        for (var cor in dados) {
            //console.log(dados[cor]);
            for (var dimensao in dados[cor]) {
                //console.log(dados[cor][dimensao]);

                var index_unidade = dimensoes.indexOf(dimensao);
                //console.log(index_unidade);
                var unidade = unidades[index_unidade];
                //console.log(unidade);

                for (var index_valor in dados[cor][dimensao]) {
                    //console.log(dados[cor][dimensao][index_valor]);

                    var valor = dados[cor][dimensao][index_valor];
                    //console.log(valor);

                    string_csv += "\"" + cor + "\";\"" + dimensao + "\";\""
                        + valor + "\";\"" + unidade + "\";\"" + index_valor + "\"\n";
                    //console.log(string_csv);
                }

            }
        }
        //console.log(string_csv);

        // inserir conteúdo na área de texto
        $("#conteudo-csv").val(string_csv);
        // selecionar conteúdo da área de texto
        $("#conteudo-csv").select();

    });


    //////////////////////////////////////////
    // lidar com a limpeza de ficheiros GPX //
    //////////////////////////////////////////

    // função para apagar os dados de uma das cores
    var apagarDados = function(cor) {
        // fazer reset aos dados da cor
        resetDados(cor);
        // remover layer do mapa
        mapa.removeLayer(nome_layer[cor]);
        // refrescar gráficos sem a cor apagada
        preencherGraficos();
        // remover cor da lista de nomes de layer
        delete nome_layer[cor];


        // remover cor do array de layers a mostrar (não mostrar coordenada em "percurso seguinte")
        var index = cores_layer.indexOf(cor);
        if (index > -1) cores_layer.splice(index, 1);
    }

    $("#apagar-vermelho").click(function() {
        apagarDados("vermelho");
        $("#ficheiro-vermelho").filestyle("clear");
    });

    $("#apagar-verde").click(function() {
        apagarDados("verde");
        $("#ficheiro-verde").filestyle("clear");
    });

    $("#apagar-azul").click(function() {
        apagarDados("azul");
        $("#ficheiro-azul").filestyle("clear");
    });

    $("#apagar-amarelo").click(function() {
        apagarDados("amarelo");
        $("#ficheiro-amarelo").filestyle("clear");
    });

    $("#apagar-laranja").click(function() {
        apagarDados("laranja");
        $("#ficheiro-laranja").filestyle("clear");
    });

});
