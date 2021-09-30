const loginService = require('./loginService.js')

module.exports = async ({ id }) => {
    const record = await loginService.findAziendaById(id)
    return `
    <div>
    <form class="js-validation-signup" action="/aziende/:id" method="POST">
    <div class="py-3">
      <div class="row">
        <div class="col-12">
          <h2 class="h5 mb-1">Dati anagrafici aziendali</h2>
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt"
              id="ragione-sociale" name="ragionesociale" placeholder="Ragione Sociale" value="">
              <h3>${record.ragionesociale}</h3>
          </div>
        </div>
        <div class="col-3">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt" id="sede-legale" 
              name="sedelegale" placeholder="Sede Legale" value="${record.sedelegale}">
          </div>
        </div>
        <div class="col-3">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt" id="localitasl"
              name="localitasl" placeholder="Località" value="${record.localitasl}">
          </div>
        </div>
        <div class="col-3">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt" id="capsl" name="capsl"
              placeholder="CAP" value="${record.capsl}">
          </div>
        </div>
        <div class="col-3">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt" id="provinciasl"
              name="provinciasl" placeholder="Provincia" value="${record.provinciasl}">
          </div>
        </div>
        <div class="col-3">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt" id="sede-operativa"
              name="sedeoperativa" placeholder="Sede Operativa" value="${record.sedeoperativa}">
          </div>
        </div>
        <div class="col-3">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt" id="localitaso"
              name="localitaso" placeholder="Località" value="${record.localitaso}">
          </div>
        </div>
        <div class="col-3">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt" id="capso" name="capso"
              placeholder="CAP" value="${record.capso}">
          </div>
        </div>
        <div class="col-3">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt" id="provinciaso"
              name="provinciaso" placeholder="Provincia" value="${record.provinciaso}">
          </div>
        </div>
        <div class="col-4">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt" id="p-iva" name="piva"
              placeholder="P.Iva" value="${record.piva}">
          </div>
        </div>
        <div class="col-4">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt" id="ateco" name="ateco"
              placeholder="ATECO" value="${record.ateco}">
          </div>
        </div>
        <div class="col-4">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt" id="categoriadirischio"
              name="categoriadirischio" placeholder="Categoria Di Rischio" value="${record.categoriadirischio}">
          </div>
        </div>
        <div class="col-6">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt"
              id="recapito-telefonico" name="recapitotelefonico" placeholder="Recapito Telefonico" value="${record.recapitotelefonico}">
          </div>    
        </div>
        <div class="col-6">
          <div class="mb-4">
            <input type="email" class="form-control form-control-lg form-control-alt" id="email"
              name="email" placeholder="Email" value="${record.email}">
          </div>
        </div>
        <div class="col-4">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt" id="referente"
              name="referente" placeholder="Referente" value="${record.referente}">
          </div>
        </div>
        <div class="col-4">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt" id="cellulare"
              name="cellulare" placeholder="Cellulare" value="${record.cellulare}">
          </div>
        </div>
        <div class="col-4">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt" id="emailreferente"
              name="emailreferente" placeholder="Email" value="${record.emailreferente}">
          </div>
        </div>
        <h2 class="h5 mb-1">Dati contrattuali</h2>
        <div class="col-2">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt"
              id="dipendentdichiarati" name="dipendentdichiarati" placeholder="Dipendenti Dichiarati" value="${record.dipendentdichiarati}">
          </div>
        </div>
        <div class="col-2">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt" id="impiegati"
              name="impiegati" placeholder="Impiegati" value="${record.impiegati}">
          </div>
        </div>
        <div class="col-2">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt" id="operai"
              name="operai" placeholder="Operai" value="${record.operai}">
          </div>
        </div>
        <div class="col-2">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt" id="autisti"
              name="autisti" placeholder="Autisti" value="${record.autisti}">
          </div>
        </div>
        <div class="col-2">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt" id="altro" name="altro"
              placeholder="Altro" value="${record.altro}">
          </div>
        </div>
        <div class="col-4">
          <div class="mb-4">
            <input type="date" class="form-control form-control-lg form-control-alt" id="iniziocontratto"
              name="iniziocontratto" placeholder="Inizio Contratto" value="${record.iniziocontratto}">
          </div>
        </div>
        <div class="col-4">
          <div class="mb-4">
            <input type="text" class="form-control form-control-lg form-control-alt" id="annualita"
              name="annualita" placeholder="Annualità" value="${record.annualita}">
          </div>
        </div>
        <div class="col-4">
          <div class="mb-4">
            <input type="date" class="form-control form-control-lg form-control-alt" id="finecontratto"
              name="finecontratto" placeholder="Fine Contratto" value="${record.finecontratto}">
          </div>
        </div>
      </div>
    </div>
    <div class="row mb-4">
      <div class="col-md-12 col-xl-12">
        <button type="submit" class="btn w-100 btn-alt-success">
          Aggiorna dati azienda
        </button>
      </div>
    </div>
  </form>
  </div>
  `
}