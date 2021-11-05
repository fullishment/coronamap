const toggler = document.querySelector('.cm_menu__toggler');
const menu = document.querySelector('.cm_menu');

toggler.addEventListener('click', () => {
    toggler.classList.toggle('active');
    menu.classList.toggle('active');
});
// 드롭다운
document.querySelector('.cm_dropbtn').addEventListener('click', () => {
    document.querySelector('.cm_dropdown').classList.toggle('cm_show');
})
//메뉴 화살표
var cm_arrow = '<span class="cm_arrowspan"></span>'
$(cm_arrow).insertBefore('.cm_mcon');

$('.cm_menu .cm_arrowspan').click(function () {
    if (
        $(this).next('.cm_mcon').hasClass('deployed')) {
        $(this).removeClass('cm_up-arrow');
        $(this).next('.cm_mcon').slideUp('fast').removeClass('deployed');
    } else {
        $(this).addClass('cm_up-arrow');
        // $('.mcon').slideUp('fast').removeClass('deployed'); // Close Other Elements
        $(this).next('.cm_mcon').slideDown('fast').addClass('deployed');
    }
});

$("#cm_logo").on("click",function(){
 location.href="http://localhost:8090/Coronagram/coronagram"; 
});
$("#cm_home").on("click",function(){
  location.href="http://localhost:8090/Coronagram/main"; 
});
$("#cm_shop").on("click",function(){
  location.href="http://localhost:8090/Coronagram/shop"; 
});
$("#cm_cld").on("click",function(){
  location.href="http://localhost:8090/Coronagram/calendar"; 
});


