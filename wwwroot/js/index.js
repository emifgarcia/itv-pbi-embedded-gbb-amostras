// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

$(function () {
    var keycloak = new Keycloak({
        url: "https://azusdstiapp-e8bxc3d5hmczfqbu.eastus-01.azurewebsites.net/",
        realm: "VALE",
        clientId: "powerbi-embedded"
    });

    keycloak.init({ onLoad: 'login-required' }).then(authenticated => {
        if (!authenticated) {
            console.warn("Não autenticado");
            return;
        }

        var models = window["powerbi-client"].models;
        var reportContainer = $("#report-container").get(0);

        fetch("/embedinfo/getembedinfo", {
            headers: {
                "Authorization": "Bearer " + keycloak.token
            }
        })
        .then(response => {
            if (!response.ok) throw new Error("Erro ao obter embed token");
            return response.json();
        })
        .then(embedParams => {
            var reportLoadConfig = {
                type: "report",
                tokenType: models.TokenType.Embed,
                accessToken: embedParams.EmbedToken.Token,
                embedUrl: embedParams.EmbedReport[0].EmbedUrl,
            };

            var report = powerbi.embed(reportContainer, reportLoadConfig);

            report.off("loaded");
            report.on("loaded", function () {
                console.log("Report carregado com sucesso");
            });

            report.off("rendered");
            report.on("rendered", function () {
                console.log("Report renderizado com sucesso");
            });

            report.off("error");
            report.on("error", function (event) {
                console.error(event.detail);
            });
        })
        .catch(error => {
            $(".embed-container").hide();
            $(".error-container").show().text(error.message);
        });
    }).catch(error => {
        console.error("Erro na autenticação Keycloak:", error);
    });
});
