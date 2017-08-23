(function($, window, document) {
  var marketName = null;
  var btcPrice = null;
  var ethPrice = null;
  var coinPriceInBtc = [];

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

    function setLoadingTooltip($elem){
      $elem.attr('data-tip', "Calculating..");
    }

	function initializeBalancePage(){
      var headerNames = ["Available Balance", "Pending Deposit", "Reserved", "Total", "Est. BTC Value", "Units"];
      $(document).on("mouseover", ' #balanceTable td.number,'+
          '#withdrawalHistoryTable td.number, #depositHistoryTable td.number', function (e) {
        var $target = $(e.target);
        if ($target[0].tagName != "td") {
          $target = $target.closest("td");
        }
        var headerName = $($target.closest('table').find('th')[$target.index()]).text();
        if(headerNames.indexOf(headerName) === -1){
          return;
        }
        if($(window).width() - ($target.offset().left + $target.width()) < 150){
          if(!$target.hasClass('closeToScreen')){
            $target.addClass('closeToScreen');
          }
        }
        else{
          if($target.hasClass('closeToScreen')){
            $target.removeClass('closeToScreen');
          }
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
            var coinPrice = (parseFloat(coinUnits)* inBtc * btcPrice);
            coinPrice = (coinPrice === 0) ? 0 :
                        (coinPrice > 1) ? coinPrice.toFixed(2) : coinPrice.toFixed(6);
            var unitPrice = inBtc * btcPrice;
            $target.attr('data-tip',
                "Total: $" + coinPrice+"\n"+
                "Unit Price: $"+ ((unitPrice> 1) ? unitPrice.toFixed(2) : unitPrice.toFixed(6))
            );
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
            var coinPrice = inBtc * btcPrice *parseFloat(coinUnits);
            coinPrice = (coinPrice === 0) ? 0 :
                        (coinPrice > 1) ? coinPrice.toFixed(2) : coinPrice.toFixed(6);
            var unitPrice = inBtc * btcPrice;
            $target.attr('data-tip',
                "Total: $" + coinPrice+'\n'+
                'Unit Price: $'+ ((unitPrice> 1) ? unitPrice.toFixed(2) : unitPrice.toFixed(6))
            );
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
        var coinPrice = parseFloat(coinUnits) * btcPrice;
        coinPrice = (coinPrice === 0) ? 0 :
                    (coinPrice > 1) ? coinPrice.toFixed(2) : coinPrice.toFixed(6);

        $target.attr('data-tip',
            "Total: $" + coinPrice+' \n'+
            'Unit Price: $'+ (1 * ((btcPrice > 1) ? btcPrice.toFixed(2) : btcPrice.toFixed(6)))
        );
      }
    }
	function initializeExchangePage() {
	  $(document).on("mouseover", '[data-bind="text: displayRate, click: clickRate"],[data-bind="text: displayPrice"],[data-bind="text: displayCost"]', function (e) {
      var $target = $(e.target);

      if ($target[0].tagName != "td") {
        $target = $target.closest("td");
      }
      setPriceTooltip($target, priceInUSD(marketName));
    });

      setInterval(function(){
        var $textEls = $('div.amcharts-chart-div g:nth-child(14) > g:nth-child(1) >text');
        if($textEls.length === 0) return;
        $('div.chart-wrapper #chartPriceinUSD').remove();
        var chartPriceInUSD = $(`<div id="chartPriceinUSD"></div>`);
        $textEls.each(function(i, el){
          var $tspan = $(el).find('tspan');
          var unitChartValue= parseFloat($tspan.text());
          var inUSD = unitChartValue*priceInUSD(marketName);
          inUSD = inUSD === 0 ? 0 :
              inUSD > 1 ? inUSD.toFixed(2) : inUSD.toFixed(6);
          var inUSDEl = inUSD > 1 ? $('<p style="position:relative; display: inline-block; margin-right:37px; top: -20px; transform: rotate(330deg);">$'+inUSD+'</p>') :
              $('<p style="position:relative; display: inline-block; margin-right:15px; top: -20px; transform: rotate(330deg);">$'+inUSD+'</p>');
          $(chartPriceInUSD).append(inUSDEl);
        });
        $('div.chart-wrapper').append(chartPriceInUSD)
      },1000);
      
    $(document).on("mouseover", "#closedMarketOrdersTable td.number", function(e) {
      var $target = $(e.target);

      var header = $target.closest("table").find("th:nth-child(" + ($target.index() + 1) + ")").text();

      if (header && (header.indexOf("Bid/Ask") != -1 || header.indexOf("Actual Rate") != -1 || header.indexOf("Cost") != -1)) {
        setPriceTooltip($target, priceInUSD(marketName));
      }
    });
  }

  function btcTooltip(){
    var headerNames = ["Last Price", "24Hr High", "24Hr Low"];
    $(document).on("mouseover", 'table:nth(2) td.number', function (e) {
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
    $(document).on("mouseover", 'table:nth(3) td.number', function (e) {
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

  function setPriceTooltip($elem, basePriceInUSD) {
    var price = $elem.text();
    var inUSD = parseFloat(basePriceInUSD) * parseFloat(price);
    inUSD = (inUSD === 0) ? 0 :
        (inUSD > 1) ? inUSD.toFixed(2) : inUSD.toFixed(6);
    $elem.attr('data-tip', "$" + inUSD);
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