
// Indeks trenutne projekcije
var trenutnaProjekcija = 0;

// ===== Validacija podataka =====
function validirajPodatke(podaci) {
    // Provjera da podaci postoje i da imaju projekcije
    if (!podaci || !podaci.projekcije || !Array.isArray(podaci.projekcije)) {
        return false;
    }

    // Provjera da postoji barem jedna projekcija
    if (podaci.projekcije.length === 0) {
        return false;
    }

    // Dozvoljeni statusi
    var dozvoljeniStatusi = ["slobodno", "zauzeto", "rezervisano"];

    // Provjera svake projekcije
    for (var i = 0; i < podaci.projekcije.length; i++) {
        var projekcija = podaci.projekcije[i];

        // Provjera da projekcija ima film, vrijeme i sjedista
        if (!projekcija.film || !projekcija.vrijeme || !projekcija.sjedista) {
            return false;
        }

        // Provjera da sjedista postoje i da je niz
        if (!Array.isArray(projekcija.sjedista) || projekcija.sjedista.length === 0) {
            return false;
        }

        // Provjera statusa svakog sjedista
        for (var j = 0; j < projekcija.sjedista.length; j++) {
            var sjediste = projekcija.sjedista[j];

            if (!sjediste.red || !sjediste.broj || !sjediste.status) {
                return false;
            }

            if (dozvoljeniStatusi.indexOf(sjediste.status) === -1) {
                return false;
            }
        }
    }

    return true;
}

// ===== Grupisanje sjedista po redovima =====
function grupirajPoRedovima(sjedista) {
    var redovi = {};

    for (var i = 0; i < sjedista.length; i++) {
        var sjediste = sjedista[i];
        var red = sjediste.red;

        if (!redovi[red]) {
            redovi[red] = [];
        }
        redovi[red].push(sjediste);
    }

    // Sortiraj sjedista unutar svakog reda po broju
    var kljucevi = Object.keys(redovi).sort();
    var sortirano = {};
    for (var k = 0; k < kljucevi.length; k++) {
        var key = kljucevi[k];
        sortirano[key] = redovi[key].sort(function (a, b) {
            return a.broj - b.broj;
        });
    }

    return sortirano;
}

// ===== Prikaz kino sale =====
function prikaziSalu(podaci) {
    var salaDiv = document.getElementById("sala");

    if (!salaDiv) {
        return;
    }

    // Brisanje postojeceg sadrzaja
    salaDiv.innerHTML = "";

    // Validacija podataka
    if (!validirajPodatke(podaci)) {
        var poruka = document.createElement("p");
        poruka.textContent = "Podaci nisu validni!";
        poruka.style.color = "#ef4444";
        poruka.style.textAlign = "center";
        poruka.style.fontSize = "1.2rem";
        poruka.style.fontWeight = "700";
        poruka.style.padding = "3rem 1rem";
        salaDiv.appendChild(poruka);
        return;
    }

    var projekcija = podaci.projekcije[trenutnaProjekcija];

    // --- Screening info ---
    var screeningInfo = document.createElement("div");
    screeningInfo.classList.add("screening-info");

    var screeningLeft = document.createElement("div");
    screeningLeft.classList.add("screening-left");

    var movieName = document.createElement("h1");
    movieName.classList.add("screening-movie");
    movieName.id = "movieName";
    movieName.textContent = projekcija.film;
    screeningLeft.appendChild(movieName);

    var screeningDetails = document.createElement("div");
    screeningDetails.classList.add("screening-details");

    // Chip - vrijeme
    var chipVrijeme = document.createElement("div");
    chipVrijeme.classList.add("detail-chip");
    chipVrijeme.innerHTML = '<span class="detail-icon">&#128336;</span><span id="movieTime">' + projekcija.vrijeme + '</span>';
    screeningDetails.appendChild(chipVrijeme);

    // Chip - projekcija broj
    var chipProj = document.createElement("div");
    chipProj.classList.add("detail-chip");
    chipProj.innerHTML = '<span class="detail-icon">&#127916;</span><span>Projekcija ' + (trenutnaProjekcija + 1) + ' / ' + podaci.projekcije.length + '</span>';
    screeningDetails.appendChild(chipProj);

    screeningLeft.appendChild(screeningDetails);
    screeningInfo.appendChild(screeningLeft);
    salaDiv.appendChild(screeningInfo);

    // --- Legenda sjedista ---
    var legend = document.createElement("div");
    legend.classList.add("seat-legend");
    legend.innerHTML =
        '<div class="legend-item"><span class="legend-seat legend-free"></span> Slobodno</div>' +
        '<div class="legend-item"><span class="legend-seat legend-taken"></span> Zauzeto</div>' +
        '<div class="legend-item"><span class="legend-seat legend-reserved"></span> Rezervisano</div>';
    salaDiv.appendChild(legend);

    // --- Platno ---
    var screenContainer = document.createElement("div");
    screenContainer.classList.add("screen-container");
    screenContainer.innerHTML =
        '<div class="screen">P L A T N O</div>' +
        '<div class="screen-glow"></div>';
    salaDiv.appendChild(screenContainer);

    // --- Raspored sjedista ---
    var hallContainer = document.createElement("div");
    hallContainer.classList.add("hall-container");

    var seatingArea = document.createElement("div");
    seatingArea.classList.add("seating-area");
    seatingArea.id = "seatingArea";

    var redovi = grupirajPoRedovima(projekcija.sjedista);
    var kljuceviRedova = Object.keys(redovi).sort();

    for (var r = 0; r < kljuceviRedova.length; r++) {
        var redOznaka = kljuceviRedova[r];
        var sjedista = redovi[redOznaka];

        var rowDiv = document.createElement("div");
        rowDiv.classList.add("seat-row");

        // Oznaka reda - lijevo
        var labelLeft = document.createElement("span");
        labelLeft.classList.add("row-label");
        labelLeft.textContent = redOznaka;
        rowDiv.appendChild(labelLeft);

        // Sjedista u redu
        for (var s = 0; s < sjedista.length; s++) {
            var sjediste = sjedista[s];
            var seatBtn = document.createElement("button");
            seatBtn.classList.add("seat");
            seatBtn.textContent = sjediste.broj;
            seatBtn.setAttribute("data-red", sjediste.red);
            seatBtn.setAttribute("data-broj", sjediste.broj);
            seatBtn.setAttribute("title", sjediste.red + sjediste.broj);

            if (sjediste.status === "slobodno") {
                seatBtn.classList.add("free");
                seatBtn.setAttribute("aria-label", "Sjedište " + sjediste.red + sjediste.broj + " - slobodno");
                // Klik: slobodno -> rezervisano
                seatBtn.addEventListener("click", (function (sj) {
                    return function () {
                        klikNaSjediste(sj, podaci);
                    };
                })(sjediste));
            } else if (sjediste.status === "zauzeto") {
                seatBtn.classList.add("taken");
                seatBtn.setAttribute("aria-label", "Sjedište " + sjediste.red + sjediste.broj + " - zauzeto");
            } else if (sjediste.status === "rezervisano") {
                seatBtn.classList.add("reserved");
                seatBtn.setAttribute("aria-label", "Sjedište " + sjediste.red + sjediste.broj + " - rezervisano");
            }

            rowDiv.appendChild(seatBtn);
        }

        // Oznaka reda - desno
        var labelRight = document.createElement("span");
        labelRight.classList.add("row-label");
        labelRight.textContent = redOznaka;
        rowDiv.appendChild(labelRight);

        seatingArea.appendChild(rowDiv);
    }

    hallContainer.appendChild(seatingArea);
    salaDiv.appendChild(hallContainer);

    // --- Reservation panel ---
    var rezervisana = dohvatiRezervisana(projekcija);

    var resPanel = document.createElement("div");
    resPanel.classList.add("reservation-panel");
    resPanel.id = "reservationPanel";
    if (rezervisana.length > 0) {
        resPanel.classList.add("has-seats");
    }

    var resLeft = document.createElement("div");
    resLeft.classList.add("reservation-left");
    var resTitle = document.createElement("h3");
    resTitle.textContent = "Vaša rezervacija";
    resLeft.appendChild(resTitle);
    var resSeats = document.createElement("p");
    resSeats.classList.add("selected-seats");
    resSeats.id = "selectedSeats";
    resSeats.textContent = rezervisana.length > 0 ? rezervisana.join(", ") : "Kliknite na zeleno sjedište za rezervaciju";
    resLeft.appendChild(resSeats);
    resPanel.appendChild(resLeft);

    var resRight = document.createElement("div");
    resRight.classList.add("reservation-right");
    var counter = document.createElement("div");
    counter.classList.add("seat-counter");
    var counterNum = document.createElement("span");
    counterNum.classList.add("counter-num");
    counterNum.id = "seatCount";
    counterNum.textContent = rezervisana.length;
    counter.appendChild(counterNum);
    var counterLabel = document.createElement("span");
    counterLabel.classList.add("counter-label");
    counterLabel.textContent = "sjedišta";
    counter.appendChild(counterLabel);
    resRight.appendChild(counter);

    var btnConfirm = document.createElement("button");
    btnConfirm.classList.add("btn-confirm");
    btnConfirm.id = "btnConfirm";
    btnConfirm.textContent = "Potvrdi rezervaciju";
    btnConfirm.disabled = rezervisana.length === 0;
    btnConfirm.addEventListener("click", function () {
        handleConfirm(podaci);
    });
    resRight.appendChild(btnConfirm);
    resPanel.appendChild(resRight);
    salaDiv.appendChild(resPanel);

    // --- Navigaciona dugmad ---
    var navContainer = document.createElement("div");
    navContainer.classList.add("projekcija-nav");

    var btnPrethodna = document.createElement("button");
    btnPrethodna.classList.add("btn-nav");
    btnPrethodna.id = "btnPrethodna";
    btnPrethodna.textContent = "\u2190 Prethodna projekcija";
    if (trenutnaProjekcija === 0) {
        btnPrethodna.disabled = true;
    }
    btnPrethodna.addEventListener("click", function () {
        prethodnaProjekcija(podaci);
    });

    var btnSljedeca = document.createElement("button");
    btnSljedeca.classList.add("btn-nav");
    btnSljedeca.id = "btnSljedeca";
    btnSljedeca.textContent = "Sljede\u0107a projekcija \u2192";
    if (trenutnaProjekcija === podaci.projekcije.length - 1) {
        btnSljedeca.disabled = true;
    }
    btnSljedeca.addEventListener("click", function () {
        sljedecaProjekcija(podaci);
    });

    navContainer.appendChild(btnPrethodna);
    navContainer.appendChild(btnSljedeca);
    salaDiv.appendChild(navContainer);

    // Ažuriraj naslov stranice
    document.title = "CineMax - " + projekcija.film + " (" + projekcija.vrijeme + ")";
}

// ===== Dohvati rezervisana sjedista =====
function dohvatiRezervisana(projekcija) {
    var rez = [];
    for (var i = 0; i < projekcija.sjedista.length; i++) {
        var sj = projekcija.sjedista[i];
        if (sj.status === "rezervisano") {
            rez.push(sj.red + sj.broj);
        }
    }
    rez.sort(function (a, b) {
        if (a[0] !== b[0]) return a[0].localeCompare(b[0]);
        return parseInt(a.slice(1)) - parseInt(b.slice(1));
    });
    return rez;
}

// ===== Klik na sjediste =====
function klikNaSjediste(sjediste, podaci) {
    // Samo slobodno moze postati rezervisano
    if (sjediste.status === "slobodno") {
        sjediste.status = "rezervisano";
        // Ponovo prikazati salu
        prikaziSalu(podaci);
    }
}

// ===== Potvrda rezervacije - modal =====
function handleConfirm(podaci) {
    var projekcija = podaci.projekcije[trenutnaProjekcija];
    var rezervisana = dohvatiRezervisana(projekcija);

    document.getElementById("modalFilm").textContent = projekcija.film;
    document.getElementById("modalTime").textContent = projekcija.vrijeme;
    document.getElementById("modalSeats").textContent = rezervisana.join(", ");
    document.getElementById("modalTotal").textContent = rezervisana.length + " sjedišta";

    // Restart confetti animacija
    var confetti = document.querySelector(".modal-confetti");
    if (confetti) {
        confetti.style.display = "none";
        confetti.offsetHeight;
        confetti.style.display = "";
    }

    // Restart icon animacija
    var icon = document.querySelector(".modal-icon");
    if (icon) {
        icon.style.animation = "none";
        icon.offsetHeight;
        icon.style.animation = "";
    }

    document.getElementById("modalOverlay").classList.add("active");
}

// ===== Zatvaranje modala =====
function closeModal() {
    document.getElementById("modalOverlay").classList.remove("active");
}

// ===== Navigacija - prethodna projekcija =====
function prethodnaProjekcija(podaci) {
    if (trenutnaProjekcija > 0) {
        trenutnaProjekcija--;
        prikaziSalu(podaci);
    }
}

// ===== Navigacija - sljedeca projekcija =====
function sljedecaProjekcija(podaci) {
    if (trenutnaProjekcija < podaci.projekcije.length - 1) {
        trenutnaProjekcija++;
        prikaziSalu(podaci);
    }
}

// ===== Pokretanje aplikacije =====
function pokreniAplikaciju(podaci) {
    trenutnaProjekcija = 0;
    prikaziSalu(podaci);

    // Mobilni meni
    var navToggle = document.getElementById("navToggle");
    var navLinks = document.getElementById("navLinks");

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", function () {
            navLinks.classList.toggle("nav-open");
            navToggle.classList.toggle("active");
        });

        var linkovi = document.querySelectorAll(".nav-links a");
        for (var i = 0; i < linkovi.length; i++) {
            linkovi[i].addEventListener("click", function () {
                navLinks.classList.remove("nav-open");
                navToggle.classList.remove("active");
            });
        }
    }

    // Modal event listeneri
    var modalClose = document.getElementById("modalClose");
    if (modalClose) {
        modalClose.addEventListener("click", closeModal);
    }

    var modalOverlay = document.getElementById("modalOverlay");
    if (modalOverlay) {
        modalOverlay.addEventListener("click", function (e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }
}
