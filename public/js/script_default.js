const currentYear = document.querySelector("#year");
const date = new Date;
currentYear.innerHTML = date.getFullYear(); 


$(document).ready(function() {
    let lastScrollTop = 0;
    if ($(this).scrollTop()>0){
        $('.navbarOriginal').css('top', '0px');
    }
    $(window).scroll(function() {
        const st = $(this).scrollTop();
        if (st > lastScrollTop) {
            $('.navbarOriginal').css('top', '0px');
        } else if (st<25) {
            $('.navbarOriginal').animate({
                top: '40px'},{
                duration: 10,
                easing: 'swing'
            });
        }
        lastScrollTop = st;
    });
});