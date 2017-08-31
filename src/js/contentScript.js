(function($, window, document) {
  var marketName = null;
  var btcPrice = null;
  var ethPrice = null;
  var coinPriceInBtc = [];
  var $tooltipEl = $(
      '<div id="crypto-correct-tooltip"></div>'
  );
	function init() {
    window.onload = function () {
      var pageType = getPageType();

      if (pageType == "EXCHANGE_PAGE") {
        initializeExchangePage();
      }
      else if(pageType == "BALANCE_PAGE"){
        initializeBalancePage();
      }
      else {
        btcTooltip();
        etherTooltip();
      }
    };

    pollPrices();
	}
    function checkWindowDistance($target, totalAndUnitClass){
      if($(window).width() - ($target.offset().left + $target.width()) < 150){
        if(!$tooltipEl.hasClass('closeToScreen')){
          $tooltipEl.addClass('closeToScreen' + (totalAndUnitClass ? "" : " reduce-margin"));
          if(totalAndUnitClass && $tooltipEl.hasClass("reduce-margin")){
            $tooltipEl.removeClass("reduce-margin");
          }
        }
      }
      else{
        if($tooltipEl.hasClass('closeToScreen')){
          $tooltipEl.removeClass('closeToScreen reduce-margin');
        }
      }
    }
    function setTooltip($target, html, totalAndUnitClass){
      if($target.is(":hover")){
        totalAndUnitClass = totalAndUnitClass || false;
        checkWindowDistance($target, totalAndUnitClass);
        if(totalAndUnitClass){
          if(!$tooltipEl.hasClass('total-and-unit')){
            $tooltipEl.addClass('total-and-unit');
          }
        }
        else {
          if($tooltipEl.hasClass('total-and-unit')){
            $tooltipEl.removeClass('total-and-unit');
          }
        }
        $tooltipEl.html(html);
        if($target.find('#crypto-correct-tooltip').length == 0){
          $target.append($tooltipEl);
        }
        $target.css('position', 'relative');
        $tooltipEl.css('display', 'inline');
        $target.mouseleave(function() {
          $tooltipEl.css('display', 'none');
        });
      }
    }
    function setLoadingTooltip($elem){
      var html = '<span class="crypto-correct-text">Calculating...</span>';
      setTooltip($elem, html, true);
    }
    function setDecimalPlaces(value){
      return (value === 0) ? 0 :
          (value > 1) ? value.toFixed(2) :
          (value > 0.1) ? value.toFixed(4) : value.toFixed(6)  ;
    }
    function setTotalAndUnitTooltip($target, inBtc, coinUnits) {
      var unitPrice = setDecimalPlaces(inBtc * btcPrice);
      var coinPrice = setDecimalPlaces(parseFloat(coinUnits) * unitPrice);
      var html =
          '<span class="crypto-correct-text">'+
            'Total: <span class="crypto-correct-price">$' + coinPrice+"</span><br />"+
            'Rate: : <span class="crypto-correct-price">$'+ unitPrice +'</span>'+
           '</span>'
      ;
      setTooltip($target, html, true);
    }

  function setPriceTooltip($elem, basePriceInUSD) {
    var price = $elem.text();
    var inUSD = setDecimalPlaces(parseFloat(basePriceInUSD) * parseFloat(price));
    var html = "<span class='crypto-correct-price'>$" + inUSD + "</span>";
    setTooltip($elem, html);
  }

	function initializeBalancePage(){
      var headerNames = ["Available Balance", "Pending Deposit", "Reserved", "Total", "Est. BTC Value", "Units"];
      $(document).on("mouseenter", ' #balanceTable td.number,'+
          '#withdrawalHistoryTable td.number, #depositHistoryTable td.number', function (e) {
        var $target = $(e.target);
        if ($target[0].tagName != "td") {
          $target = $target.closest("td");
        }
        var headerName = $($target.closest('table').find('th')[$target.index()]).text();
        if(headerNames.indexOf(headerName) === -1){
          return;
        }

        if(headerName === "Est. BTC Value"){
          setPriceTooltip($target, btcPrice);
          return;
        }
        var coinName = ($target.closest('#balanceTable').length > 0) ? $($target.siblings('td.text')[0]).text():
                        $($target.siblings('td.text')[1]).text();
        var coinUnits =  $target.text();

        if(coinPriceInBtc[coinName]){
          var lastTime = coinPriceInBtc[coinName].lastTime;
          var thisTime = parseInt(new Date().getTime() / 1000);
          if(thisTime - lastTime < 20 || coinName == 'BTC') {
            var inBtc = coinPriceInBtc[coinName].inBtc;
            setTotalAndUnitTooltip($target, inBtc, coinUnits);
          }
          else{
            calculateAndShowInUSD($target, coinName, coinUnits);
          }
        }
        else{
          calculateAndShowInUSD($target, coinName, coinUnits);
        }
      });
    }

    function calculateAndShowInUSD($target, coinName, coinUnits){
      setLoadingTooltip($target);
      if(coinName != 'BTC') {
        $.get(Config.bittrexApiUrlV1 + "/public/getticker?market=BTC-" + coinName).then(function (response) {
          if (response.success) {
            var inBtc = response.result.Last;
            coinPriceInBtc[coinName] = coinPriceInBtc[coinName] || {};
            coinPriceInBtc[coinName].inBtc = inBtc;
            coinPriceInBtc[coinName].lastTime = parseInt(new Date().getTime() / 1000);
            setTotalAndUnitTooltip($target, inBtc, coinUnits);
          }
          else {
            console.error(response.error);
          }
        });
      }
      else{
        coinPriceInBtc[coinName] = coinPriceInBtc[coinName] || {};
        coinPriceInBtc[coinName].inBtc = 1;
        coinPriceInBtc[coinName].lastTime = 0;
        setTotalAndUnitTooltip($target, 1, coinUnits);
      }
    }
	function initializeExchangePage() {
	  $(document).on("mouseenter", '[data-bind="text: displayRate, click: clickRate"],[data-bind="text: displayPrice"],[data-bind="text: displayCost"]', function (e) {
      var $target = $(e.target);

      if ($target[0].tagName != "td") {
        $target = $target.closest("td");
      }
      setPriceTooltip($target, priceInUSD(marketName));
    });
    $(document).on("mouseenter", "#closedMarketOrdersTable td.number", function(e) {
      var $target = $(e.target);

      var header = $target.closest("table").find("th:nth-child(" + ($target.index() + 1) + ")").text();

      if (header && (header.indexOf("Bid/Ask") != -1 || header.indexOf("Actual Rate") != -1 || header.indexOf("Cost") != -1)) {
        setPriceTooltip($target, priceInUSD(marketName));
      }
    });
  }

  function btcTooltip(){
    var headerNames = ["Last Price", "24Hr High", "24Hr Low"];
    $(document).on("mouseenter", 'table:nth(2) td.number', function (e) {
      var $target = $(e.target);
      if ($target[0].tagName != "td") {
        $target = $target.closest("td");
      }
      var headerName = $($target.closest('table').find('th')[$target.index()]).text().trim();
      if(headerNames.indexOf(headerName) === -1){
        return;
      }
      var btcToUSD = getBTCtoUSD();
      setPriceTooltip($target, btcToUSD);
    });
  }
  function etherTooltip(){
    var headerNames = ["Last Price", "24Hr High", "24Hr Low"];
    $(document).on("mouseenter", 'table:nth(3) td.number', function (e) {
      var $target = $(e.target);
      if ($target[0].tagName != "td") {
        $target = $target.closest("td");
      }
      var headerName = $($target.closest('table').find('th')[$target.index()]).text().trim();
      if(headerNames.indexOf(headerName) === -1){
        return;
      }
      var etherToUSD = getETHtoUSD();
      setPriceTooltip($target, etherToUSD);
    });
  }

  function getBTCtoUSD(){
    return btcPrice;
  }

  function getETHtoUSD(){
    return ethPrice;
  }

  function priceInUSD(marketName) {
    var priceInUSD = null;
    if (marketName == "BTC" || marketName == "btc") {
      priceInUSD = getBTCtoUSD();
    }
    else if (marketName == "ETH" || marketName == "eth") {
      priceInUSD = getETHtoUSD()
    }

    return priceInUSD;
  }

  function getQueryParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
  
  function getPageType() {
    var pageType = "HOME_PAGE";
    marketName = getQueryParam("MarketName");
    var isBalancePage = window.location.href.indexOf('balance')> -1 || window.location.href.indexOf('Balance')> -1;
    if (marketName) {
      pageType = "EXCHANGE_PAGE";
      marketName = marketName.split("-")[0];
    }
    else if(isBalancePage){
      pageType = "BALANCE_PAGE";
    }

    return  pageType;
  }

  function pollPrices() {
    setInterval(function () {
      updatePrices();
    }, Config.pricePollTimeInSec * 1000);

    updatePrices();
  }

  function updatePrices() {
    if (!document.hidden) {
      const ethPricePromise = $.get(Config.bittrexApiUrlV1 + "/public/getticker?market=BTC-ETH");

      $.get(Config.bittrexApiUrlV2 + "/currencies/GetBTCPrice").then(function (data) {
        if (data.success) {
          btcPrice = data.result.bpi.USD.rate_float;

          return ethPricePromise.then(function(data) {
            if (data.success) {
              ethPrice = data.result.Last * btcPrice;
            }
            else {
              console.error(data);
            }
          });
        }
        else {
          console.error(data.error);
        }
      });
    }
  }

  $.expr.filters.offscreen = function(el) {
    var rect = el.getBoundingClientRect();
    return (
      (rect.x + rect.width) < 0
      || (rect.y + rect.height) < 0
      || (rect.x > window.innerWidth || rect.y > window.innerHeight)
    );
  };

	init();
})(jQuery, window, document);