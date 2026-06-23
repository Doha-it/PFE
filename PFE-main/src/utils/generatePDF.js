import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateFacturePDF = (
    facture,
    articles,
    total,
    nomCaissier
) => {

    if (!articles || articles.length === 0) {
        alert("Aucun article à afficher !");
        return;
    }

    const doc = new jsPDF();

    // =========================
    // TITRE
    // =========================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("FACTURE", 105, 20, {
        align: "center",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(
        `N° Facture : ${facture?.id || "-"}`, 15, 35
    );



    // =========================
    // INFORMATIONS
    // =========================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    doc.text("Informations", 15, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    
    doc.text(
        `Vente N° : ${
            facture?.venteId ||
            facture?.id ||
            "-"
        }`,
        15,
        68
    );

    doc.text(
        `Date et heure : ${new Date().toLocaleString(
            "fr-FR"
        )}`,
        15,
        76
    );

    // =========================
    // TABLEAU DES ARTICLES
    // =========================

    const tableData = articles.map(
        (article) => [
            article.nomProduit || "-",
            article.codeBarres || "-",
            article.quantite || 1,
            `${parseFloat(
                article.prix || 0
            ).toFixed(2)} DH`,
            `${parseFloat(
                article.sousTotal || 0
            ).toFixed(2)} DH`,
        ]
    );

    autoTable(doc, {
        startY: 90,

        head: [[
            "Produit",
            "Code-barres",
            "Qté",
            "Prix",
            "Sous-total",
        ]],

        body: tableData,

        theme: "grid",

        headStyles: {
            fillColor: [60, 60, 60],
            textColor: [255, 255, 255],
            halign: "center",
        },

        styles: {
            fontSize: 9,
        },

        columnStyles: {
            2: {
                halign: "center",
            },
            3: {
                halign: "right",
            },
            4: {
                halign: "right",
            },
        },
    });

    // =========================
    // TOTAL
    // =========================

    const finalY =
        doc.lastAutoTable.finalY + 15;

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(14);

    doc.text(
        `TOTAL : ${parseFloat(
            total || 0
        ).toFixed(2)} DH`,
        195,
        finalY,
        {
            align: "right",
        }
    );

    // =========================
    // REMERCIEMENT
    // =========================

    doc.setFont(
        "helvetica",
        "italic"
    );

    doc.setFontSize(10);

    doc.text(
        "Merci pour votre achat.",
        105,
        finalY + 20,
        {
            align: "center",
        }
    );

    // =========================
    // FOOTER
    // =========================

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(8);

    doc.text(
        "LibrairyPro - Système de gestion de librairie",
        105,
        285,
        {
            align: "center",
        }
    );

    // =========================
    // TÉLÉCHARGEMENT
    // =========================

    doc.save(
        `Facture_${
            facture?.id || "LibrairyPro"
        }.pdf`
    );
};