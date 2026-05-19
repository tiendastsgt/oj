import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

# Margins and styles
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_elements(num_pages)
            super().showPage()
        super().save()

    def draw_page_elements(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#7F8C8D"))
        
        # Draw legal left margin line (traditional in Guatemalan courts)
        self.setStrokeColor(colors.HexColor("#BDC3C7"))
        self.setLineWidth(0.5)
        self.line(54, 36, 54, 756) # 0.75 inch left margin line
        
        # Header (except first page of carátula/demanda)
        if self._pageNumber > 1:
            self.drawString(72, 762, "ORGANISMO JUDICIAL DE GUATEMALA - SISTEMA DE GESTIÓN DE EXPEDIENTES (SGED)")
            self.setStrokeColor(colors.HexColor("#34495E"))
            self.setLineWidth(1)
            self.line(72, 756, 540, 756)
            
        # Footer
        page_text = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(540, 36, page_text)
        self.drawString(72, 36, "DOCUMENTO DIGITALIZADO - VALIDEZ JURÍDICA DECRETO 47-2008")
        self.setStrokeColor(colors.HexColor("#BDC3C7"))
        self.setLineWidth(0.5)
        self.line(72, 46, 540, 46)
        
        # Watermark/Background decoration
        self.setFont("Helvetica-Bold", 45)
        self.setFillColor(colors.HexColor("#F2F4F4"))
        # Angled watermark
        self.saveState()
        self.translate(300, 400)
        self.rotate(45)
        self.drawCentredString(0, 0, "SGED - VALIDEZ OFICIAL")
        self.restoreState()
        
        self.restoreState()


def create_legal_pdf(filepath, title, category, exp_num, details):
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=1.0 * inch,
        bottomMargin=1.0 * inch
    )

    styles = getSampleStyleSheet()
    
    # Custom styles matching elite OJ aesthetic
    title_style = ParagraphStyle(
        'OJTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#1A252C"),
        alignment=1, # Center
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'OJSubtitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#C39B62"), # Gold
        spaceAfter=10
    )
    
    meta_style = ParagraphStyle(
        'OJMeta',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#2C3E50"),
        spaceAfter=15
    )
    
    body_style = ParagraphStyle(
        'OJBody',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        textColor=colors.HexColor("#2C3E50"),
        alignment=4, # Justified
        spaceAfter=10
    )
    
    sign_style = ParagraphStyle(
        'OJSign',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#1A252C"),
        alignment=1, # Center
        spaceAfter=5
    )

    story = []
    
    # Received Stamp Table simulation (Top Right on Memoriales)
    if category == "MEMORIAL":
        stamp_data = [
            [Paragraph("<b>OJ - RECIBIDO - JUZGADO GENERAL</b>", ParagraphStyle('St', fontName='Helvetica-Bold', fontSize=7, leading=9, textColor=colors.HexColor("#27AE60")))],
            [Paragraph(f"Fecha: {details.get('fecha_recibido', '18/05/2026')}", ParagraphStyle('St2', fontName='Helvetica', fontSize=7, leading=8))],
            [Paragraph(f"Expediente: <b>{exp_num}</b>", ParagraphStyle('St3', fontName='Helvetica', fontSize=7, leading=8))],
            [Paragraph("Firma Auxiliar: _____________", ParagraphStyle('St4', fontName='Helvetica', fontSize=7, leading=8))]
        ]
        stamp_table = Table(stamp_data, colWidths=[200])
        stamp_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'RIGHT'),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#27AE60")),
            ('PADDING', (0,0), (-1,-1), 6),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#E8F8F5")),
        ]))
        
        # Wrap stamp in another table to align it right
        wrapper_data = [["", stamp_table]]
        wrapper_table = Table(wrapper_data, colWidths=[270, 200])
        wrapper_table.setStyle(TableStyle([
            ('ALIGN', (1,0), (1,0), 'RIGHT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(wrapper_table)
        story.append(Spacer(1, 15))

    # Header / Title Block
    story.append(Paragraph("ORGANISMO JUDICIAL DE GUATEMALA", title_style))
    story.append(Paragraph(f"JUZGADO DE PRIMERA INSTANCIA CIVIL Y ECONÓMICO COACTIVO DE GUATEMALA", ParagraphStyle('Court', parent=title_style, fontSize=11, leading=14, spaceAfter=5)))
    story.append(Paragraph(f"<b>EXPEDIENTE NUMERO:</b> {exp_num}", ParagraphStyle('ExpNo', parent=title_style, fontName='Helvetica-Bold', fontSize=12, leading=15, textColor=colors.HexColor("#C39B62"))))
    
    story.append(Spacer(1, 10))
    story.append(Paragraph(f"<b>TIPO DOCUMENTO:</b> {title.upper()}<br/><b>CATEGORÍA:</b> {category}", meta_style))
    story.append(Spacer(1, 10))
    
    # Body paragraphs
    story.append(Paragraph("RESUMEN DEL DOCUMENTO:", subtitle_style))
    
    # Core narrative simulation
    narrative = details.get("contenido", [])
    for para in narrative:
        story.append(Paragraph(para, body_style))
        story.append(Spacer(1, 5))
        
    story.append(Spacer(1, 20))
    
    # Signature blocks
    if "firmas" in details:
        sig_data = []
        sig_cols = []
        for sig in details["firmas"]:
            sig_data.append(Paragraph(f"f) _____________________________<br/><b>{sig['nombre']}</b><br/>{sig['cargo']}", sign_style))
            sig_cols.append(220)
        
        # Arrange signatures in grid/row
        if len(sig_data) == 2:
            sig_table = Table([[sig_data[0], sig_data[1]]], colWidths=[235, 235])
        elif len(sig_data) == 1:
            sig_table = Table([[sig_data[0]]], colWidths=[470])
        else:
            sig_table = Table([sig_data], colWidths=[470/len(sig_data)]*len(sig_data))
            
        sig_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(sig_table)
        
    doc.build(story, canvasmaker=NumberedCanvas)


def generate_all_samples():
    out_dir = r"C:\proyectos\oj\medios_para_test\samples"
    os.makedirs(out_dir, exist_ok=True)
    
    # Let's write typical documents
    documents = [
        # 1. Demanda Inicial
        {
            "name": "Demanda_Inicial.pdf",
            "title": "DEMANDA INICIAL DE JUICIO ORDINARIO",
            "category": "MEMORIAL",
            "exp_num": "01173-2026-00045",
            "details": {
                "fecha_recibido": "10/01/2026 09:15",
                "contenido": [
                    "<b>SEÑOR JUEZ DE PRIMERA INSTANCIA DEL RAMO CIVIL DEL DEPARTAMENTO DE GUATEMALA.</b>",
                    "MARIO ALBERTO GÓMEZ MEJÍA, de cuarenta y cinco años de edad, casado, guatemalteco, abogado y notario, de este domicilio, actúo bajo mi propia dirección y procuración profesional.",
                    "Señalo como lugar para recibir notificaciones la oficina profesional ubicada en la décima calle número cuatro guion veinticuatro de la zona uno de esta ciudad capital.",
                    "Comparezco a interponer formalmente <b>DEMANDA INICIAL DE JUICIO ORDINARIO DE DAÑOS Y PERJUICIOS</b> en contra del señor CARLOS HUMBERTO REYES RUANO, quien puede ser notificado en su residencia ubicada en la calzada Roosevelt doce guion cincuenta y cuatro de la zona once, de conformidad con los siguientes hechos:",
                    "<b>I. DE LOS HECHOS:</b> El día quince de noviembre del año dos mil veinticinco, el demandado provocó un colisión vial que causó daños severos a mi propiedad inmueble y lesiones físicas directas, estimándose los daños materiales en la cantidad de CIEN MIL QUETZALES EXACTOS (Q.100,000.00) más intereses legales acumulados hasta la fecha de la efectiva resolución de este litigio.",
                    "<b>II. FUNDAMENTO DE DERECHO:</b> El artículo 1645 del Código Civil establece que toda persona que cause daño a otra, sea intencionalmente, sea por descuido o imprudencia, está obligada a repararlo, salvo que demuestre que el daño se produjo por culpa o negligencia inexcusable de la víctima...",
                    "<b>III. MEDIOS DE PRUEBA:</b> A) Declaración de las partes. B) Documentos consistentes en actas notariales, facturas de reparación y dictamen pericial automotriz. C) Reconocimiento judicial que deberá realizar el juzgador.",
                    "<b>IV. PETICIONES DE TRAMITE Y DE FONDO:</b> Que se admita para su trámite la presente demanda en la vía ordinaria, se emplace al demandado por el término de ley bajo apercibimiento de comparecer, y en su momento se dicte sentencia declarando CON LUGAR la demanda y condenando al pago de daños y perjuicios."
                ],
                "firmas": [
                    {"nombre": "Mario Alberto Gómez Mejía", "cargo": "Presentante / Abogado Auxiliante"}
                ]
            }
        },
        # 2. Contestacion
        {
            "name": "Contestacion_Demanda.pdf",
            "title": "CONTESTACIÓN DE DEMANDA EN SENTIDO NEGATIVO Y EXCEPCIONES",
            "category": "MEMORIAL",
            "exp_num": "01173-2026-00045",
            "details": {
                "fecha_recibido": "28/01/2026 14:30",
                "contenido": [
                    "<b>SEÑOR JUEZ DE PRIMERA INSTANCIA DEL RAMO CIVIL DEL DEPARTAMENTO DE GUATEMALA.</b>",
                    "CARLOS HUMBERTO REYES RUANO, de treinta y ocho años de edad, soltero, guatemalteco, comerciante, comparezco con el auxilio profesional del Abogado Luis Felipe Estrada López, señalando casillero electrónico OJ-LF993 para recibir futuras notificaciones procesales.",
                    "Vengo a contestar formalmente la demanda de daños y perjuicios interpuesta en mi contra, haciéndolo en <b>SENTIDO NEGATIVO</b> e interponiendo la <b>EXCEPCIÓN PERENTORIA DE FALTA DE VERACIDAD DE LOS HECHOS E INEXISTENCIA DE RESPONSABILIDAD DIRECTA</b>.",
                    "<b>HECHOS:</b> Es falso de toda falsedad que el suscrito haya provocado la colisión referida. Conforme consta en el parte policial de tránsito número 459-2025 de fecha quince de noviembre, el accidente fue ocasionado de manera exclusiva por la imprudencia del propio actor, quien conducía a exceso de velocidad e ignoró la señal de alto en la intersección.",
                    "Por lo tanto, la obligación de reparar el daño alegada carece de sustento legal al configurarse la excepción de culpa exclusiva de la víctima regulada en el mismo cuerpo normativo civil citado por el demandante.",
                    "<b>PRUEBAS:</b> Copia certificada del informe policial de tránsito y declaración testimonial del agente de la Policía Municipal de Tránsito que redactó el parte."
                ],
                "firmas": [
                    {"nombre": "Carlos Humberto Reyes Ruano", "cargo": "Demandado"},
                    {"nombre": "Abogado Luis Felipe Estrada", "cargo": "Dirección y Procuración"}
                ]
            }
        },
        # 3. Resolucion Decreto
        {
            "name": "Resolucion_Admision.pdf",
            "title": "DECRETO DE ADMISIÓN A TRÁMITE",
            "category": "RESOLUCION",
            "exp_num": "01173-2026-00045",
            "details": {
                "contenido": [
                    "<b>JUZGADO DE PRIMERA INSTANCIA CIVIL Y ECONÓMICO COACTIVO DE GUATEMALA. GUATEMALA, VEINTE DE ENERO DE DOS MIL VEINTISEIS.</b>",
                    "I) Se tiene por presentado el memorial de demanda inicial que antecede, documentos adjuntos y copias de ley correspondientes, presentados por el señor Mario Alberto Gómez Mejía.",
                    "II) Se admite para su trámite en la VÍA ORDINARIA la presente demanda de Daños y Perjuicios interpuesta.",
                    "III) Se emplaza al demandado señor CARLOS HUMBERTO REYES RUANO por el término de NUEVE DÍAS hábiles, más el término de la distancia que corresponda, para que comparezca a tomar una actitud procesal frente a la demanda interpuesta, bajo apercibimiento de ley de declarársele rebelde si no comparece en el tiempo establecido.",
                    "IV) Téngase por señalado el lugar para recibir notificaciones y por propuestos los medios de prueba individualizados en el apartado respectivo.",
                    "Artículos: 25, 26, 44, 50, 51, 61, 62, 63, 66, 79, 106, 107, 111, 112 del Código Procesal Civil y Mercantil de Guatemala.",
                    "<b>NOTIFÍQUESE.</b>"
                ],
                "firmas": [
                    {"nombre": "Lic. Estuardo René Aldana", "cargo": "Juez de Primera Instancia"},
                    {"nombre": "Licda. Brenda Isabel Ortiz", "cargo": "Secretaria de Juzgado"}
                ]
            }
        },
        # 4. Auto Medida Cautelar
        {
            "name": "Auto_Medida_Cautelar.pdf",
            "title": "AUTO DE MEDIDA CAUTELAR DE EMBARGO PREVENTIVO",
            "category": "RESOLUCION",
            "exp_num": "01173-2026-00045",
            "details": {
                "contenido": [
                    "<b>JUZGADO DE PRIMERA INSTANCIA CIVIL Y ECONÓMICO COACTIVO DE GUATEMALA. GUATEMALA, DOS DE FEBRERO DE DOS MIL VEINTISEIS.</b>",
                    "<b>CONSIDERANDO:</b> Que el demandante Mario Alberto Gómez Mejía solicitó como medida precautoria el embargo de cuentas bancarias y de un vehículo propiedad del demandado, argumentando temor fundado de que el demandado se insolvente o enajene sus bienes durante el proceso ordinario.",
                    "<b>CONSIDERANDO:</b> Que la ley procesal guatemalteca faculta al juzgador a decretar las medidas cautelares indispensables para asegurar el resultado del proceso ordinario siempre que se acompañe título suficiente o se preste garantía correspondiente, lo cual ha quedado satisfecho en autos mediante la fianza consignada.",
                    "<b>POR TANTO:</b> Este Juzgado con base en lo considerado y leyes citadas, <b>RESUELVE:</b> I) Con lugar la solicitud de medida de garantía. II) Se decreta el <b>EMBARGO PREVENTIVO</b> de las cuentas bancarias de depósitos monetarios y de ahorro que posea el demandado CARLOS HUMBERTO REYES RUANO en el sistema financiero nacional hasta por la suma de CIEN MIL QUETZALES. III) Ofíciese a la Superintendencia de Bancos para el debido cumplimiento.",
                    "Artículos: 523, 527, 532 del Código Procesal Civil y Mercantil."
                ],
                "firmas": [
                    {"nombre": "Lic. Estuardo René Aldana", "cargo": "Juez de Primera Instancia"},
                    {"nombre": "Licda. Brenda Isabel Ortiz", "cargo": "Secretaria de Juzgado"}
                ]
            }
        },
        # 5. Acta de Audiencia (Penal)
        {
            "name": "Acta_Audiencia_Penal.pdf",
            "title": "ACTA DE AUDIENCIA DE PRIMERA DECLARACIÓN",
            "category": "ACTA",
            "exp_num": "01108-2026-01234",
            "details": {
                "contenido": [
                    "<b>JUZGADO DE PRIMERA INSTANCIA PENAL, NARCOACTIVIDAD Y DELITOS CONTRA EL MEDIO AMBIENTE. GUATEMALA, VEINTE DE ABRIL DE DOS MIL VEINTISEIS.</b>",
                    "En la ciudad de Guatemala, siendo las diez horas en punto, constituido en la sala de audiencias el Juez de Primera Instancia Penal, licenciado Francisco Javier Solórzano, asistido por la secretaria que autoriza.",
                    "Se da inicio a la audiencia de <b>PRIMERA DECLARACIÓN</b> del sindicado señor EDGAR RENE PEREZ TOBAR en el expediente penal número 01108-2026-01234 por el delito de ESTAFA PROPIA.",
                    "<b>COMPARECEN:</b> Por el Ministerio Público, la Auxiliar Fiscal Especializada licenciada Claudia Marina Chinchilla. Por la defensa técnica, el abogado defensor particular Hugo Leonel Estrada. El sindicado comparece de manera voluntaria.",
                    "<b>DESARROLLO DE LA AUDIENCIA:</b> El Juez procede a verificar los datos de identificación personal del sindicado. Posteriormente se le otorga la palabra a la representación del Ministerio Público para que realice la intimación de los hechos imputados. La fiscal detalla que el sindicado vendió un inmueble con gravamen oculto el día 10 de diciembre de 2025, recibiendo la suma de Q.150,000.00.",
                    "El sindicado, previa advertencia de su derecho constitucional de abstenerse de declarar sin que ello le perjudique, manifiesta que desea prestar declaración, indicando que actuó de buena fe y que el gravamen fue inscrito posteriormente por un tercero de manera fraudulenta.",
                    "El Juez suspende momentáneamente la diligencia para deliberar sobre el auto de procesamiento correspondiente.",
                    "Se finaliza la presente diligencia en el mismo lugar y fecha, siendo las once horas con treinta minutos, firmando los comparecientes para constancia legal."
                ],
                "firmas": [
                    {"nombre": "Edgar René Pérez Tobar", "cargo": "Sindicado"},
                    {"nombre": "Claudia Marina Chinchilla", "cargo": "Auxiliar Fiscal MP"},
                    {"nombre": "Lic. Francisco Javier Solórzano", "cargo": "Juez Contralor"}
                ]
            }
        },
        # 6. Cédula de Notificación
        {
            "name": "Cedula_Notificacion.pdf",
            "title": "CÉDULA DE NOTIFICACIÓN PROCESAL",
            "category": "COMUNICACIONES",
            "exp_num": "01173-2026-00045",
            "details": {
                "contenido": [
                    "<b>CENTRO DE SERVICIOS AUXILIARES DE LA ADMINISTRACIÓN DE JUSTICIA DE GUATEMALA.</b>",
                    "En la ciudad de Guatemala, el día veintiuno de enero del año dos mil veintiséis, siendo las once horas con quince minutos.",
                    "Constituido en la dirección señalada en autos: <b>Calzada Roosevelt 12-54 zona 11, Ciudad de Guatemala.</b>",
                    "Procedo a notificar a: <b>CARLOS HUMBERTO REYES RUANO</b>, el contenido íntegro del DECRETO DE ADMISIÓN A TRÁMITE dictado por el Juzgado de Primera Instancia Civil con fecha veinte de enero de dos mil veintiséis.",
                    "Para el efecto, hago entrega de las copias físicas del memorial de demanda y documentos adjuntos que constan de un total de veinticuatro folios debidamente numerados y sellados.",
                    "Habiendo comparecido a atender la diligencia el propio interesado, quien se identifica con DPI código único 2345 98765 0101, procedió a estampar su firma de recibido en la copia de la presente cédula de notificación procesal para constancia legal.",
                    "<b>DOY FE.</b>"
                ],
                "firmas": [
                    {"nombre": "Carlos Humberto Reyes", "cargo": "Persona Notificada"},
                    {"nombre": "Juan Manuel Castillo", "cargo": "Notificador Judicial II"}
                ]
            }
        },
        # 7. Sentencia (Fase final de Juicio Ordinario)
        {
            "name": "Sentencia_Ordinario.pdf",
            "title": "SENTENCIA DEFINITIVA EN JUICIO CIVIL",
            "category": "RESOLUCION",
            "exp_num": "01173-2026-00045",
            "details": {
                "contenido": [
                    "<b>JUZGADO DE PRIMERA INSTANCIA CIVIL Y ECONÓMICO COACTIVO DE GUATEMALA. GUATEMALA, VEINTE DE ABRIL DE DOS MIL VEINTISEIS.</b>",
                    "Se tiene a la vista para dictar <b>SENTENCIA</b> el expediente del Juicio Ordinario de Daños y Perjuicios arriba identificado.",
                    "<b>CONSIDERANDO:</b> Que el actor Mario Alberto Gómez demostró plenamente mediante dictamen pericial judicial los daños estructurales causados por la colisión provocada por el vehículo del demandado, logrando acreditar el nexo causal directo entre la acción negligente del demandado y el menoscabo patrimonial sufrido por el demandante.",
                    "<b>CONSIDERANDO:</b> Que el demandado Carlos Reyes no logró probar de manera fehaciente su defensa de culpa exclusiva de la víctima, toda vez que el informe oficial concluye que viajaba a velocidad superior a la permitida por la vía pública.",
                    "<b>POR TANTO:</b> Este Juzgado con base en las leyes citadas declara: I) <b>CON LUGAR</b> la demanda ordinaria de daños y perjuicios. II) Se condena al demandado al pago exacto de OCHENTA Y CINCO MIL QUETZALES en concepto de daño emergente, más intereses legales. III) Se condena en costas procesales al demandado por haber litigado con evidente temeridad.",
                    "<b>NOTIFÍQUESE.</b>"
                ],
                "firmas": [
                    {"nombre": "Lic. Estuardo René Aldana", "cargo": "Juez de Primera Instancia"},
                    {"nombre": "Licda. Brenda Isabel Ortiz", "cargo": "Secretaria de Juzgado"}
                ]
            }
        }
    ]

    for doc in documents:
        filepath = os.path.join(out_dir, doc["name"])
        print(f"Generating realistic PDF: {doc['name']}...")
        create_legal_pdf(filepath, doc["title"], doc["category"], doc["exp_num"], doc["details"])
        
    print("\nSuccessfully generated all realistic judicial PDF samples!")


if __name__ == "__main__":
    generate_all_samples()
