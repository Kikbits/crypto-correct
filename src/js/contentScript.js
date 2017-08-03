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
      $(document).on("mouseover", 'td.number.sorting_1', function (e) {
        var $target = $(e.target);

        if ($target[0].tagName != "td") {
          $target = $target.closest("td");
        }
        setPriceTooltip($target, btcPrice);
      });

      $(document).on("mouseover", '#withdrawalHistoryTable td.number, #depositHistoryTable td.number', function (e) {
        var $target = $(e.target);
        if ($target[0].tagName != "td") {
          $target = $target.closest("td");
        }
        var coinName = $($target.siblings('td.text')[1]).text();
        var coinUnits =  $target.text();
        if(coinPriceInBtc[coinName]){
          var lastTime = coinPriceInBtc[coinName].lastTime;
          var thisTime = parseInt(new Date().getTime() / 1000);
          if(thisTime - lastTime < 20 || coinName == 'BTC') {
            var inBtc = coinPriceInBtc[coinName].inBtc;
            var coinPrice = (parseFloat(coinUnits)* inBtc * btcPrice);
            if (coinPrice < 1) {
              coinPrice = coinPrice.toFixed(6);
            }
            else {
              coinPrice = coinPrice.toFixed(2);
            }
            $target.attr('data-tip', "$" + coinPrice);
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
            if (coinPrice < 1) {
              coinPrice = coinPrice.toFixed(6);
            }
            else {
              coinPrice = coinPrice.toFixed(2);
            }
            $target.attr('data-tip', "$" + coinPrice);
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
        if (coinPrice < 1) {
          coinPrice = coinPrice.toFixed(6);
        }
        else {
          coinPrice = coinPrice.toFixed(2);
        }
        $target.attr('data-tip', "$" + coinPrice);
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

	  $(document).on("mouseover", "#closedMarketOrdersTable td.number", function(e) {
      $target = $(e.target);

      var header = $target.closest("table").find("th:nth-child(" + ($target.index() + 1) + ")").text();

      if (header && (header.indexOf("Bid/Ask") != -1 || header.indexOf("Actual Rate") != -1 || header.indexOf("Cost") != -1)) {
        setPriceTooltip($target, priceInUSD(marketName));
      }
    });
  }

  function btcTooltip(){
    $(document).arrive('div.col-md-12:first-child tr:nth-child(2)',{fireOnAttributesModification: true, existing: true},function(){
      var btcRows = $('div.col-md-12:first tr');
      if(btcRows.length > 1){
        btcRows.each(function(i, el){
          if(i>0) {
            $(el).find('td:nth-child(5)').mouseover(function () {
              var btcToUSD = getBTCtoUSD();
              setPriceTooltip($(this), btcToUSD);
            });
            $(el).find('td:nth-child(6)').mouseover(function () {
              var btcToUSD = getBTCtoUSD();
              setPriceTooltip($(this), btcToUSD);
            });
            $(el).find('td:nth-child(7)').mouseover(function () {
              var btcToUSD = getBTCtoUSD();
              setPriceTooltip($(this), btcToUSD);
            });
          }
        });
      }
    });
  }
  function etherTooltip(){
    $(document).arrive('div.col-md-12:nth-child(2) tr:nth-child(2)',{fireOnAttributesModification: true, existing: true},function(){
      var etherRows = $('div.col-md-12:nth-child(2) tr');
      if(etherRows.length > 1){
        etherRows.each(function(i, el){
          if(i>0) {
            $(el).find('td:nth-child(5)').mouseover(function () {
              var etherToUSD = getETHtoUSD();
              setPriceTooltip($(this), etherToUSD);
            });
            $(el).find('td:nth-child(6)').mouseover(function () {
              var etherToUSD = getETHtoUSD();
              setPriceTooltip($(this), etherToUSD);
            });
            $(el).find('td:nth-child(7)').mouseover(function () {
              var etherToUSD = getETHtoUSD();
              setPriceTooltip($(this), etherToUSD);
            });
          }
        });
      }
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

    if (inUSD < 1) {
      inUSD = inUSD.toFixed(6);
    }
    else {
      inUSD = inUSD.toFixed(2);
    }

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
//class="tooltip" data-tip="this is the tip!"