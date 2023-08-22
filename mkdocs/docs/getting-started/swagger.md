<style>
    html {
        overflow: hidden;
    }
</style>
<swagger-ui supportedSubmitMethods="[]" id="swagger-stuff" src="https://petstore.swagger.io/v2/swagger.json" scrolling="yes"/>

<script>
    window.onload = function() {
        let iframeId = document.querySelector("iframe").id;
        let iframe = document.getElementById(iframeId);
        const doc = iframe.contentWindow.document;
        let style = 
          'body {' +
          '  overflow: scroll;' +
          '}';
        doc.open();
        doc.write(style);
        doc.close();
    }
</script>
