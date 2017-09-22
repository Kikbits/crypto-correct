(function($, window, document) {
  var marketName = null;
  var btcPrice = null;
  var ethPrice = null;
  var coinPriceInBtc = [];
  var $tooltipEl = $(
      '<div id="crypto-correct-tooltip"></div>'
  );
  var oneMinDataBTC;
  var fiveMinDataBTC;
  var thirtyMinDataBTC;
  var dayDataBTC;
    var hourDataBTC;
    var oneMinDataETH;
    var fiveMinDataETH;
    var thirtyMinDataETH;
    var hourDataETH;
    var dayDataETH;

    function callApi(market){
        if (!localStorage.getItem('oneMinData'+market) || (new Date()-Date.parse(localStorage.getItem('oneMinData'+market)))>300000){
            $.ajax({
                url : "https://bittrex.com/Api/v2.0/pub/market/GetTicks?marketName=USDT-"+market+"&tickInterval=oneMin",
                dataType : 'json',
                type : 'GET'
            }).done(function(res, textStatus, jqXHR ){
                if (market=='BTC')
                    oneMinDataBTC=res;
                else
                    oneMinDataETH=res;
                localStorage.setItem('oneMinData'+market, new Date());
            });
        }
        if (!localStorage.getItem('fiveMinData'+market) || (new Date()-Date.parse(localStorage.getItem('fiveMinData'+market)))>300000) {
            $.ajax({
                url: "https://bittrex.com/Api/v2.0/pub/market/GetTicks?marketName=USDT-"+market+"&tickInterval=fiveMin",
                dataType: 'json',
                type: 'GET'
            }).done(function (res, textStatus, jqXHR) {
                if (market=='BTC')
                    fiveMinDataBTC = res;
                else
                    fiveMinDataETH=res;
                localStorage.setItem('fiveMinData'+market, new Date());
            });
        }
        if (!localStorage.getItem('thirtyMinData'+market) || (new Date()-Date.parse(localStorage.getItem('thirtyMinData'+market)))>1800000) {
            $.ajax({
                url: "https://bittrex.com/Api/v2.0/pub/market/GetTicks?marketName=USDT-"+market+"&tickInterval=thirtyMin&",
                dataType: 'json',
                type: 'GET'
            }).done(function (res, textStatus, jqXHR) {
                if (market=='BTC')
                    thirtyMinDataBTC = res;
                else
                    thirtyMinDataETH=res;
                localStorage.setItem('thirtyMinData'+market,  new Date());
            });
        }
        if (!localStorage.getItem('dayData'+market) || (new Date()-Date.parse(localStorage.getItem('dayData'+market)))>86400000) {
            $.ajax({
                url: "https://bittrex.com/Api/v2.0/pub/market/GetTicks?marketName=USDT-"+market+"&tickInterval=day",
                dataType: 'json',
                type: 'GET'
            }).done(function (res, textStatus, jqXHR) {
                if (market=='BTC')
                    dayDataBTC = res;
                else
                    dayDataETH=res;
                localStorage.setItem('dayData'+market,  new Date());
            });
        }
        if (!localStorage.getItem('hourData'+market) || (new Date()-Date.parse(localStorage.getItem('hourData'+market)))>3600000) {
            $.ajax({
                url: "https://bittrex.com/Api/v2.0/pub/market/GetTicks?marketName=USDT-"+market+"&tickInterval=hour",
                dataType: 'json',
                type: 'GET'
            }).done(function (res, textStatus, jqXHR) {
                if (market=='BTC')
                    hourDataBTC = res;
                else
                    hourDataETH=res;
                localStorage.setItem('hourData'+market,  new Date());
            });
        }
    }
	function init() {

    window.onload = function () {
      var pageType = getPageType();
        callApi(marketName);
        setInterval(function(){
            callApi(marketName);
        }, 60000);

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


        //setPriceTooltip($target, priceInUSD(marketName));
       setPriceTooltip($target, historicalPriceInUSD(marketName,$(this).closest("tr.odd,tr.even").find("td.date.sorting_1").text()));
      }
    });
  }
  function getHistoricalBTCtoUSD(dateTime,oneMinData,fiveMinData,thirtyMinData,hourData,dayData){
    var time=dateTime.split(' ')[1]+' '+dateTime.split(' ')[2];
    var localDateTime=dateTime.split(' ')[0]+' '+convertTime12to24(time);
    var daysDifference=parseInt(((new Date())- new Date(localDateTime))/(24*3600*1000));
    var UTCtime = new Date(localDateTime).toISOString();
    if (daysDifference<=9){
      for (var i =0;i<oneMinData.result.length;i++){

        var difference = ((new Date(UTCtime))-(new Date(oneMinData.result[i].T)));
        var diffMins = Math.floor((difference/1000)/60);
        if(diffMins<=1){
          return oneMinData.result[i].O;
          break;
        }
      }
        if (oneMinData.result && oneMinData.result.length)
            return oneMinData.result[oneMinData.result.length-1].O;
    }
    else if (daysDifference<19){
      for (var i =0;i<fiveMinData.result.length;i++){

        var difference = ((new Date(UTCtime))-(new Date(fiveMinData.result[i].T)));
        var diffMins = Math.floor((difference/1000)/60);
        if(diffMins<=5){
          return fiveMinData.result[i].O;
          break;
        }
      }
        if (fiveMinData.result && fiveMinData.result.length)
            return fiveMinData.result[fiveMinData.result.length-1].O;
    }
    else if (daysDifference<39){
      for (var i =0;i<thirtyMinData.result.length;i++){

        var difference = ((new Date(UTCtime))-(new Date(thirtyMinData.result[i].T)));
        var diffMins = Math.floor((difference/1000)/60);
        if(diffMins<=35){
          return thirtyMinData.result[i].O;
          break;
        }
      }
        if (thirtyMinData.result && thirtyMinData.result.length)
            return thirtyMinData.result[thirtyMinData.result.length-1].O;
    }
    else if (daysDifference<58){
        for (var i =0;i<hourData.result.length;i++){

            var difference = ((new Date(UTCtime))-(new Date(hourData.result[i].T)));
            var diffMins = Math.floor((difference/1000)/60);
            if(diffMins<=65){
                return hourData.result[i].O;
                break;
            }
        }
        if (hourData.result && hourData.result.length)
            return hourData.result[hourData.result.length-1].O;
    }
    else if (daysDifference<92400){
      for (var i =0;i<dayData.result.length;i++){

        var difference = ((new Date(UTCtime))-(new Date(dayData.result[i].T)));
        var diffMins = Math.floor((difference/1000)/60);
        if(diffMins<=1240){
          return dayData.result[i].O;
          break;
        }
      }
        if (dayData.result && dayData.result.length)
            return dayData.result[dayData.result.length-1].O;
    }

  }
  function convertTime12to24(time12h) {
    const [time, modifier] = time12h.split(' ');

    let [hours, minutes] = time.split(':');

    if (hours === '12') {
      hours = '00';
    }

    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }

    return hours + ':' + minutes;
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
  function historicalPriceInUSD(marketName,date) {
    var priceInUSD = null;
    if (marketName == "BTC" || marketName == "btc") {
      priceInUSD = getHistoricalBTCtoUSD(date,oneMinDataBTC,fiveMinDataBTC,thirtyMinDataBTC,hourDataBTC,dayDataBTC);
    }
    else if (marketName == "ETH" || marketName == "eth") {
      priceInUSD = getHistoricalBTCtoUSD(date,oneMinDataETH,fiveMinDataETH,thirtyMinDataETH,hourDataETH,dayDataETH)
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