$.fn.stars = function() {
    return $(this).each(function() {
        // Get the value
        var val = parseFloat($(this).html());
        // Make sure that the value is in 0 - 5 range, multiply to get width
        var size = Math.max(0, (Math.min(5, val))) * 16;
        val = Math.round(val * 4) / 4; /* To round to nearest quarter */
        //val = Math.round(val * 2) / 2; /* To round to nearest half */
        // Create stars holder
        var $span = $('<span />').width(size);
        // Replace the numerical value with stars
        $(this).html($span);
    });
}

$.nutanixUtils = (function() {

    // ajax utils
    var _fetchData,
        setApiHits,
        getProductList,
        _appendProduct,
        saveLikes,
        setPreviousLikes;

    _fetchData = function(url, callback) {

        var ajaxOptions = {
            url: url,
            type: 'post',
            async: true,
            dataType: 'json',
            beforeSend: function() {
                $('.spinner').show();
            },
            complete: function() {
                $('.spinner').hide();
            },
            success: function(responseData, textStatus, jqXHR) {
                console.log(responseData);
                callback(responseData);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            },
            timeout: 100000
        };

        $.ajax(ajaxOptions);
    };

    setApiHits = function() {
        var apiHitsData = _fetchData('http://nutanix.0x10.info/api/deals?type=json&query=api_hits',
            function(apiHits) {
                $('#apiHits').text(apiHits.api_hits);
            });
        return nutanixUtils;
    };

    getProductList = function() {
        var productList = _fetchData('http://nutanix.0x10.info/api/deals?type=json&query=list_deals',
            function(productList) {
                $.each(productList.deals, function(index, productInfo) {
                    _appendProduct(productInfo);
                });
                $('span.stars').stars();
            });
        return nutanixUtils;
    };

    _appendProduct = function(productInfo) {
        // fast elem creation with doc.create
        var product = $(document.createElement('div')).addClass('item col-xs-12 col-sm-6 col-md-4 col-lg-4');


        var shape = $(document.createElement('div')).addClass('shape')
            .append($(document.createElement('div')).addClass('shape-text').text(productInfo.discount));

        product.append(shape);

        var thumbnail = $(document.createElement('div')).addClass('thumbnail')
            .append($(document.createElement('img'))
                .attr({
                    'class': 'productImage',
                    'src': productInfo.image,
                    'alt': productInfo.name
                }));

        var descripton = $(document.createElement('div')).addClass('description')
            .append($(document.createElement('a')).attr({
                'class': 'productName',
                'href': productInfo.link,
                'target': '_blank'
            }).text(productInfo.name))
            .append($(document.createElement('span')).addClass('seller')
                .append($(document.createElement('i')).text('Provider: '))
                .append(productInfo.provider))
            .append($(document.createElement('div')).addClass('rating')
                .append($(document.createElement('span')).addClass('stars')
                    .text(productInfo.rating))
                .append(productInfo.rating));

        var finalPrice = parseInt(parseFloat(productInfo.actual_price) -
            (parseFloat(productInfo.actual_price) * parseFloat(productInfo.discount) / 100));

        var cost = $(document.createElement('div')).addClass('cost')
            .append($(document.createElement('span')).addClass('price')
                .append($(document.createElement('i')).addClass('fa fa-tag fa-flip-horizontal'))
                .append($(document.createElement('i')).addClass('fa fa-inr'))
                .append(finalPrice))
            .append($(document.createElement('span')).addClass('oldPrice')
                .append($(document.createElement('i')).addClass('fa fa-inr'))
                .append(productInfo.actual_price));

        var providerLink = $(document.createElement('div')).addClass('provider')
            .append($(document.createElement('a')).attr({
                    'class': 'link',
                    'href': productInfo.link,
                    'target': '_blank'
                })
                .append($(document.createElement('i')).addClass('fa fa-link'))
                .append(productInfo.link));

        var likes = $(document.createElement('div')).addClass('likes')
            .append($(document.createElement('i')).attr({
                    'id': productInfo.name.split(' ')[0] + productInfo.provider,
                    'class': 'fa fa-thumbs-o-up'
                }).text('0'));

        descripton.append(cost).append(providerLink).append(likes);
        thumbnail.append(descripton);
        product.append(thumbnail);

        $('.productList').append(product);
        setPreviousLikes(productInfo.name.split(' ')[0] + productInfo.provider);
    };

    saveLikes = function(elem) {

        var totalLikes = (localStorage.getItem('totalLikes') ? localStorage.getItem('totalLikes') : 0),
            productLikes = parseInt(elem.find('i').text()),
            key = elem.find('i').attr('id');

        if (elem.attr('class').indexOf('active') === -1) {
            elem.addClass('active');
            productLikes = productLikes + 1;
            totalLikes = parseInt(totalLikes) + 1;
        } else {
            elem.removeClass('active');
            productLikes = productLikes - 1;
            totalLikes = parseInt(totalLikes) - 1;
        }

        elem.find('i').text(productLikes);
        localStorage.setItem(key, productLikes);
        localStorage.setItem('totalLikes', totalLikes);
        $('#likesCount').text(totalLikes);
        return nutanixUtils;
    };

    setPreviousLikes = function(key) {
        if (localStorage.getItem(key)) {
            $('#' + key).text(localStorage.getItem(key));
        } else {
            localStorage.setItem(key, 0);
        }
    };

    return nutanixUtils = {
        getProductList: getProductList,
        setApiHits: setApiHits,
        saveLikes: saveLikes
    };

}());

$(document).ready(function() {
    $.nutanixUtils.setApiHits().getProductList();
    $('#likesCount').text(localStorage.getItem('totalLikes') ? localStorage.getItem('totalLikes') : 0);
    $('body').on('click', '.likes', function() {
        $.nutanixUtils.saveLikes($(this));
    });

});
