import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://mkerqgqxwepnsienmtdp.supabase.co";
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZXJxZ3F4d2VwbnNpZW5tdGRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzkwNjAsImV4cCI6MjA3OTc1NTA2MH0.F5uWbob-SVzYwvScrfpH_4ERl69tmJhDGjqJdbNzuHU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.addEventListener("DOMContentLoaded", () => {
    const wagonsContainer = document.getElementById("wagons-container");
    const addWagonBtn = document.getElementById("add-wagon");
    const form = document.getElementById("train-form");
    const errorDiv = document.getElementById("error-message");
    const successDiv = document.getElementById("success-message");

    // STEP 4: CREA UNA RIGA CARRO
    function createWagonRow(wagonNumber = null) {
        const div = document.createElement("div");
        div.className = "wagon-row";

        if (wagonNumber === null) {
            wagonNumber = document.querySelectorAll(".wagon-row").length + 1;
        }

        div.innerHTML = `
      <div class="wagon-number">Carro #${wagonNumber}</div>
      
      <div class="form-group">
        <label>
          Numero carro
          <input name="numero_carro" type="text" inputmode="numeric" maxlength="16" placeholder="16 cifre o ultime 4" required />
        </label>
        <label>
          Tara (Kg)
          <input name="tara_kg" type="number" inputmode="numeric" min="0"/>
        </label>
      </div>

      <div class="form-group">
        <label>
          Massa frenata (t)
          <input name="massa_frenata_t" type="number" inputmode="numeric" min="0" class="massa_frenata"/>
        </label>
        <label>
          Frenatua
          <select name="frenatura" required>
            <option value="">- Scegli -</option>
            <option value="G">G</option>
            <option value="P">P</option>
          </select>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" name="isolato" value="true" class="isolato_checkbox" />
          Isolato
        </label>
        <label class="note_isolato_label" style="display: none;">
          Note carro isolato
          <textarea name="note_isolato" rows="4" cols="50" maxlength="500" placeholder="Inserisci informazioni relativo al carro isolato..."></textarea>
        </label>
      </div>

      <div class="form-group">
        <label>
          Freno a mano (t)
          <input name="freno_mano_kn" type="number" inputmode="numeric" min="0"/>
        </label>
        <label>
          Tipo suole
          <select name="tipo_suole" required>
            <option value="">- Scegli -</option>
            <option value="L">L</option>
            <option value="LL">LL</option>
            <option value="K">K</option>
            <option value="Ghisa">Ghisa</option>
          </select>
        </label>
      </div>

      <div class="form-group">
        <label>
          Velocità (km/h)
          <input name="velocita_kmh" type="number" inputmode="numeric" min="0"/>
        </label>
        <label>
          Stato revisione
          <select name="stato_revisione" required>
            <option value="">- Scegli -</option>
            <option value="OK">OK</option>
            <option value="in scadenza">In scadenza</option>
            <option value="scaduto">Scaduto</option>
          </select>
        </label>
        <label class="note_generiche_label">
          Note generiche carro
          <textarea name="note_generiche" rows="4" cols="50" maxlength="500" placeholder="Inserisci informazioni aggiuntive relative ad etichette o altro..."></textarea>
        </label>
      </div>
    `;

        // Logica checkbox/textarea per questo carro
        const checkbox = div.querySelector(".isolato_checkbox");
        const noteIsolatoLabel = div.querySelector(".note_isolato_label");

        checkbox.checked = false;
        noteIsolatoLabel.style.display = "none";

        checkbox.addEventListener("change", function () {
            if (this.checked) {
                noteIsolatoLabel.style.display = "block";
            } else {
                noteIsolatoLabel.style.display = "none";
            }
        });

        wagonsContainer.appendChild(div);
    }

    // STEP 5: AGGIUNGI CARRO
    addWagonBtn.addEventListener("click", (e) => {
        e.preventDefault();
        createWagonRow();
    });

    // STEP 6: PRIMA RIGA CARRO
    createWagonRow();

    // STEP 7: SUBMIT FORM
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById("submit-btn");
        submitBtn.disabled = true;

        errorDiv.style.display = "none";
        successDiv.style.display = "none";

        try {
            // STEP 8: DATI TRENO
            const dataPartenza = form.data_partenza.value;
            const numeroTreno = form.numero_treno.value;
            const locomotiva = form.locomotiva.value;
            const serieLocomotiva = form.serie_locomotiva.value;
            const emailDestinatario = form.email_destinatario.value;
            const telefonoContatto = form.telefono_contatto.value;

            console.log("🚂 Dati treno:", {
                dataPartenza,
                numeroTreno,
                locomotiva,
                serieLocomotiva,
                emailDestinatario,
                telefonoContatto,
            });

            // STEP 9: INSERT TRAINS
            const { data: train, error: trainError } = await supabase
                .from("trains")
                .insert({
                    data_partenza: dataPartenza,
                    numero_treno: numeroTreno,
                    locomotiva: locomotiva,
                    serie_locomotiva: serieLocomotiva,
                    email_destinatario: emailDestinatario,
                    telefono_contatto: telefonoContatto,
                })
                .select()
                .single();

            if (trainError) {
                console.error("❌ Errore inserimento treno:", trainError);
                throw trainError;
            }

            console.log("✅ Treno inserito con ID:", train.id);

            // STEP 10: DATI CARRI
            const wagonRows = document.querySelectorAll(".wagon-row");
            const wagons = [];
            const trainId = train.id;

            wagonRows.forEach((row, index) => {
                const numeroInput = row.querySelector('input[name="numero_carro"]');
                const taraInput = row.querySelector('input[name="tara_kg"]');
                const massaFrenataInput = row.querySelector(
                    'input[name="massa_frenata_t"]'
                );
                const frenoManoInput = row.querySelector('input[name="freno_mano_kn"]');
                const velocitaInput = row.querySelector('input[name="velocita_kmh"]');
                const frenaturaSelect = row.querySelector('select[name="frenatura"]');
                const tipoSuoleSelect = row.querySelector('select[name="tipo_suole"]');
                const statoRevisioneSelect = row.querySelector(
                    'select[name="stato_revisione"]'
                );
                const noteIsolatoTextarea = row.querySelector(
                    'textarea[name="note_isolato"]'
                );
                const noteGenericheTextarea = row.querySelector(
                    'textarea[name="note_generiche"]'
                );

                const numero = numeroInput ? numeroInput.value.trim() : "";
                const tara = parseFloat(taraInput ? taraInput.value : "0") || 0;
                const massaFrenata =
                    parseFloat(massaFrenataInput ? massaFrenataInput.value : "0") || 0;
                const frenoMano =
                    parseFloat(frenoManoInput ? frenoManoInput.value : "0") || 0;
                const velocita =
                    parseFloat(velocitaInput ? velocitaInput.value : "0") || 0;
                const frenatura = frenaturaSelect ? frenaturaSelect.value : "";
                const tipoSuole = tipoSuoleSelect ? tipoSuoleSelect.value : "";
                const statoRevisione = statoRevisioneSelect
                    ? statoRevisioneSelect.value
                    : "";
                const note_isolato = noteIsolatoTextarea
                    ? noteIsolatoTextarea.value.trim()
                    : "";
                const note_generiche = noteGenericheTextarea
                    ? noteGenericheTextarea.value.trim()
                    : "";

                if (!numero) {
                    throw new Error(
                        `Il campo "Numero carro" è obbligatorio per il carro #${index + 1
                        }.`
                    );
                }

                wagons.push({
                    train_id: trainId,
                    numero_carro: numero,
                    tara_kg: tara,
                    massa_frenata_t: massaFrenata,
                    freno_mano_kn: frenoMano,
                    velocita_kmh: velocita,
                    frenatura: frenatura,
                    tipo_suole: tipoSuole,
                    stato_revisione: statoRevisione,
                    note_isolato,
                    note_generiche,
                });
            });

            // INSERT WAGONS
            if (wagons.length > 0) {
                const { data: insertedWagons, error: wagonsError } = await supabase
                    .from("wagons")
                    .insert(wagons);

                if (wagonsError) {
                    console.error("❌ Errore inserimento carri:", wagonsError);
                    throw wagonsError;
                }

                console.log("✅ Carri inseriti:", insertedWagons);

                const response = await fetch(
                    "https://mkerqgqxwepnsienmtdp.supabase.co/functions/v1/send-train-email",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                        },
                        body: JSON.stringify({
                            train,
                            wagons,
                        }),
                    }
                );

                if (!response.ok) {
                    console.error("❌ Errore invio email:", await response.text());
                    alert("Dati salvati ma invio email fallito.");
                } else {
                    console.log("✅ Email inviata con successo");
                }
            }

            successDiv.innerText = "Dati inviati con successo.";
            successDiv.style.display = "block";
            form.reset();
            wagonsContainer.innerHTML = "";
            createWagonRow();
        } catch (err) {
            console.error("❌ Errore durante l'invio:", err);
            errorDiv.innerText = err.message || JSON.stringify(err);
            errorDiv.style.display = "block";
        } finally {
            submitBtn.disabled = false;
        }
    });
});

