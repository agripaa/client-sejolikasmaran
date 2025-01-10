(function ($) {
  "use strict";
  // Page loading
  $(window).on("load", function () {
    $("#preloader-active").delay(450).fadeOut("slow");
    $("body").delay(450).css({
      overflow: "visible",
    });
  });
  /*-----------------
        Menu Stick
    -----------------*/
  var header = $(".sticky-bar");
  var win = $(window);
  win.on("scroll", function () {
    var scroll = win.scrollTop();
    if (scroll < 20) {
      header.removeClass("stick");
    } else {
      header.addClass("stick");
    }
  });

  /*Carausel 2 columns*/
  $(".carausel-2-columns").each(function (key, item) {
    var id = $(this).attr("id");
    var sliderID = "#" + id;
    var appendArrowsClassName = "#" + id + "-arrows";

    $(sliderID).slick({
      dots: false,
      infinite: true,
      speed: 1000,
      arrows: true,
      autoplay: true,
      slidesToShow: 2,
      slidesToScroll: 1,
      loop: true,
      adaptiveHeight: true,
      responsive: [
        {
          breakpoint: 1025,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
      prevArrow:
        '<span class="mr-4 text-blue-500 flex"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"></path></svg></span>',
      nextArrow:
        '<span class="text-blue-500  flex"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg></span>',
      appendArrows: appendArrowsClassName,
    });
  });

  /*Carausel Fade*/
  $(".carausel-fade").each(function (key, item) {
    var id = $(this).attr("id");
    var sliderID = "#" + id;
    var appendArrowsClassName = "#" + id + "-arrows";

    $(sliderID).slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      fade: true,
      loop: true,
      dots: false,
      arrows: true,
      prevArrow:
        '<span class="mr-4 text-blue-500 flex"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"></path></svg></span>',
      nextArrow:
        '<span class="text-blue-500  flex"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg></span>',
      appendArrows: appendArrowsClassName,
      autoplay: true,
    });
  });

  /*Carausel Fade has Dots*/
  $(".carausel-fade-2").each(function (key, item) {
    var id = $(this).attr("id");
    var sliderID = "#" + id;
    var appendArrowsClassName = "#" + id + "-arrows";

    $(sliderID).slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      fade: true,
      loop: true,
      dots: true,
      arrows: false,
      autoplay: true,
    });
  });

  /*---------------------
        Mobile menu active
    ------------------------ */
  var $offCanvasNav = $(".mobile-menu"),
    $offCanvasNavSubMenu = $offCanvasNav.find(".dropdown");

  /*Add Toggle Button With Off Canvas Sub Menu*/
  $offCanvasNavSubMenu.parent().prepend('<span class="menu-expand">+</span>');

  /*Close Off Canvas Sub Menu*/
  $offCanvasNavSubMenu.slideUp();

  /*Category Sub Menu Toggle*/
  $offCanvasNav.on("click", "li a, li .menu-expand", function (e) {
    var $this = $(this);
    if (
      $this
        .parent()
        .attr("class")
        .match(/\b(menu-item-has-children|has-children|has-sub-menu)\b/) &&
      ($this.attr("href") === "#" || $this.hasClass("menu-expand"))
    ) {
      e.preventDefault();
      if ($this.siblings("ul:visible").length) {
        $this.parent("li").removeClass("active");
        $this.siblings("ul").slideUp();
      } else {
        $this.parent("li").addClass("active");
        $this
          .closest("li")
          .siblings("li")
          .removeClass("active")
          .find("li")
          .removeClass("active");
        $this.closest("li").siblings("li").find("ul:visible").slideUp();
        $this.siblings("ul").slideDown();
      }
    }
  });

  /*------ ScrollUp -------- */
  $.scrollUp({
    scrollText:
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>',
    easingType: "linear",
    scrollSpeed: 900,
    animation: "fade",
  });

  /*------ Wow Active ----*/
  new WOW().init();

  /*---- CounterUp ----*/
  $(".count").counterUp({
    delay: 10,
    time: 2000,
  });
})(jQuery);
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  let score = 2; // Set initial score to 2

  // Ambil nilai dari form
  const ageFirstPregnancy = parseInt(urlParams.get("ageFirstPregnancy")) || 0;
  const currentPregnancyOver35 =
    parseInt(urlParams.get("currentPregnancyOver35")) || 0;
  const yearsSinceFirstPregnancy =
    parseInt(urlParams.get("yearsSinceFirstPregnancy")) || 0;
  const failedPregnancy = parseInt(urlParams.get("failedPregnancy")) || 0;
  const caesarean = parseInt(urlParams.get("caesarean")) || 0;
  const forceps = parseInt(urlParams.get("forceps")) || 0;
  const manualPlacenta = parseInt(urlParams.get("manualPlacenta")) || 0;
  const infusionTransfusion =
    parseInt(urlParams.get("infusionTransfusion")) || 0;

  // Kesehatan Ibu
  const anemia = parseInt(urlParams.get("anemia")) || 0;
  const malaria = parseInt(urlParams.get("malaria")) || 0;
  const tbc = parseInt(urlParams.get("tbc")) || 0;
  const heartDisease = parseInt(urlParams.get("heartDisease")) || 0;
  const diabetes = parseInt(urlParams.get("diabetes")) || 0;
  const std = parseInt(urlParams.get("std")) || 0;

  // Kondisi Kehamilan
  const swelling = parseInt(urlParams.get("swelling")) || 0;
  const multiplePregnancy = parseInt(urlParams.get("multiplePregnancy")) || 0;
  const hydramnion = parseInt(urlParams.get("hydramnion")) || 0;
  const stillbirth = parseInt(urlParams.get("stillbirth")) || 0;
  const overdue = parseInt(urlParams.get("overdue")) || 0;
  const breech = parseInt(urlParams.get("breech")) || 0;
  const transverse = parseInt(urlParams.get("transverse")) || 0;
  const bleeding = parseInt(urlParams.get("bleeding")) || 0;
  const preeclampsia = parseInt(urlParams.get("preeclampsia")) || 0;

  // Perhitungan Skor Berdasarkan Faktor Risiko
  score += ageFirstPregnancy <= 16 ? 4 : 0; // Faktor 1
  score += currentPregnancyOver35 ? 4 : 0; // Faktor 2
  score += yearsSinceFirstPregnancy >= 4 ? 4 : 0; // Faktor 3
  score += parseInt(urlParams.get("yearsSinceLastPregnancy")) <= 2 ? 4 : 0; // Faktor 5
  score += parseInt(urlParams.get("numberOfChildren")) >= 4 ? 4 : 0; // Faktor 6
  score += ageFirstPregnancy >= 35 ? 4 : 0; // Faktor 7
  score += parseInt(urlParams.get("height")) <= 145 ? 4 : 0; // Faktor 8

  // Riwayat kehamilan sebelumnya
  score += failedPregnancy ? 4 : 0; // Faktor 9a
  score += forceps ? 4 : 0; // Faktor 9b
  score += infusionTransfusion ? 4 : 0; // Faktor 9c
  score += caesarean ? 8 : 0; // Faktor 10

  // Penyakit pada ibu
  score += anemia ? 4 : 0; // Faktor 11a
  score += malaria ? 4 : 0;
  score += tbc ? 4 : 0; // Faktor 11b
  score += heartDisease ? 4 : 0;
  score += diabetes ? 4 : 0; // Faktor 11c
  score += std ? 4 : 0; // Faktor 11d

  // Kondisi kehamilan saat ini
  score += swelling ? 4 : 0; // Faktor 12
  score += multiplePregnancy ? 4 : 0; // Faktor 13
  score += hydramnion ? 4 : 0; // Faktor 14
  score += stillbirth ? 4 : 0; // Faktor 15
  score += overdue ? 4 : 0; // Faktor 16
  score += breech ? 8 : 0; // Faktor 17
  score += transverse ? 8 : 0; // Faktor 18
  score += bleeding ? 8 : 0; // Faktor 19
  score += preeclampsia ? 8 : 0; // Faktor 20

  // Tentukan hasil berdasarkan skor
  let status = "";
  let explanation = "";

  if (score <= 2) {
    status = "Kehamilan yang Sehat";
    explanation = `
                <p class="mb-4">Status Kehamilan: <span class="font-bold text-green-600">Kehamilan yang Sehat</span></p>
                <p>Selamat, kehamilan Anda dalam kondisi baik. Anda dapat merencanakan persalinan di Poliklinik Desa (POLINDES) dengan pendampingan bidan kami. Tidak diperlukan rujukan khusus, dan kami siap membantu Anda menjalani proses persalinan dengan tenang dan nyaman.</p>
            `;
  } else if (score >= 3 && score <= 11) {
    status = "Kehamilan dengan Perhatian Lebih";
    explanation = `
                <p class="mb-4">Status Kehamilan: <span class="font-bold text-yellow-600">Kehamilan dengan Perhatian Lebih</span></p>
                <p>Kehamilan Anda memerlukan perhatian lebih. Kami menyarankan Anda untuk menjalani persalinan di fasilitas kesehatan yang lebih lengkap seperti Puskesmas atau Rumah Sakit. Di sana, bidan dan dokter akan mendampingi serta memastikan semua kebutuhan persalinan Anda terpenuhi dengan baik.</p>
            `;
  } else {
    status = "KRST (Kehamilan dengan Penanganan Intensif)";
    explanation = `
                <p class="mb-4">Status Kehamilan: <span class="font-bold text-red-600">Kehamilan dengan Penanganan Intensif</span></p>
                <p>Kehamilan Anda membutuhkan penanganan intensif. Kami menyarankan agar Anda segera mendapatkan pelayanan di fasilitas kesehatan, di mana dokter dan tenaga medis siap mendampingi proses persalinan Anda. Kami berkomitmen untuk memberikan dukungan terbaik demi keselamatan Anda dan bayi Anda.</p>
            `;
  }

  // Tampilkan hasil di halaman
  document.getElementById("score").innerText = score;
  document.getElementById("status").innerText = status;
  document.getElementById("explanation").innerHTML = explanation;
});
