(function($) {
	function init() {
		btcTooltip();
		etherTooltip();
		USDTTooltip();


		function btcTooltip(){
			$(document).arrive('div.col-md-12:first-child tr:nth-child(2)',{fireOnAttributesModification: true, existing: true},function(){
				var btcRows = $('div.col-md-12:first tr');
				if(btcRows.length > 1){
					btcRows.each(function(i, el){
						if(i>0) {
							$(el).find('td:nth-child(5)').mouseover(function () {
								var btcToUSD = getBTCtoUSD();
								var lastPrice = $(this).text();
								var inUSD = parseFloat(btcToUSD) * parseFloat(lastPrice);
								$(this).attr('data-tip',("Last Price in USD = $"+inUSD));
							});
							$(el).find('td:nth-child(6)').mouseover(function () {
								var btcToUSD = getBTCtoUSD();
								var high = $(this).text();
								var inUSD = parseFloat(btcToUSD) * parseFloat(high);
								$(this).attr('data-tip',("24HR HIGH in USD = $"+inUSD));
							});
							$(el).find('td:nth-child(7)').mouseover(function () {
								var btcToUSD = getBTCtoUSD();
								var low = $(this).text();
								var inUSD = parseFloat(btcToUSD) * parseFloat(low);
								$(this).attr('data-tip',("24HR LOW  in USD = $"+inUSD));
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
								var etherToUSD = getEtherToUSD();
								var lastPrice = $(this).text();
								var inUSD = parseFloat(etherToUSD) * parseFloat(lastPrice);
								$(this).attr('data-tip',("Last Price in USD = $"+inUSD));
							});
							$(el).find('td:nth-child(6)').mouseover(function () {
								var etherToUSD = getEtherToUSD();
								var high = $(this).text();
								var inUSD = parseFloat(etherToUSD) * parseFloat(high);
								$(this).attr('data-tip',("24HR HIGH in USD = $"+inUSD));
							});
							$(el).find('td:nth-child(7)').mouseover(function () {
								var etherToUSD = getEtherToUSD();
								var low = $(this).text();
								var inUSD = parseFloat(etherToUSD) * parseFloat(low);
								$(this).attr('data-tip',("24HR LOW  in USD = $"+inUSD));
							});
						}
					});
				}
			});
		}
		function USDTTooltip(){
			$(document).arrive('div.col-md-12:nth-child(3) tr:nth-child(2)',{fireOnAttributesModification: true, existing: true},function(){
				var USDTRows = $('div.col-md-12:nth-child(3) tr');
				if(USDTRows.length > 1){
					USDTRows.each(function(i, el){
						if(i>0) {
							$(el).find('td:nth-child(5)').mouseover(function () {
								var usdtToUSD = getUSDTToUSD();
								var lastPrice = $(this).text();
								var inUSD = parseFloat(usdtToUSD) * parseFloat(lastPrice);
								$(this).attr('data-tip',("Last Price in USD = $"+inUSD));
							});
							$(el).find('td:nth-child(6)').mouseover(function () {
								var usdtToUSD = getUSDTToUSD();
								var high = $(this).text();
								var inUSD = parseFloat(usdtToUSD) * parseFloat(high);
								$(this).attr('data-tip',("24HR HIGH in USD = $"+inUSD));
							});
							$(el).find('td:nth-child(7)').mouseover(function () {
								var usdtToUSD = getUSDTToUSD();
								var low = $(this).text();
								var inUSD = parseFloat(usdtToUSD) * parseFloat(low);
								$(this).attr('data-tip',("24HR LOW  in USD = $"+inUSD));
							});
						}
					});
				}
			});
		}
		function getBTCtoUSD(){
			var expression = $('.container-footer .navbar-nav.navbar-right li:nth-child(2)').text().trim();
			return expression.substring("1 BTC = $".length,expression.length);
		}
		function getEtherToUSD(){
			return '280';
		}
		function getUSDTToUSD(){
			return '200';
		}
	}
	init();
})(jQuery);
//class="tooltip" data-tip="this is the tip!"