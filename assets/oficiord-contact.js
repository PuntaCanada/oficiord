// Moderated, opt-in contact requests. Email addresses are never included in public API listings.
(()=>{
 const lang=document.documentElement.lang?.split('-')[0]||'es';
 const copy={
  es:{cta:'Solicitar contacto (revisión manual)',heading:'Contactar sobre este anuncio',details:'Tu mensaje y correo se enviarán únicamente al equipo de moderación. Tras revisarlo, podremos trasladar tu consulta y tu dirección de correo al titular del anuncio. No se garantiza respuesta ni contratación.',email:'Tu correo electrónico',message:'Mensaje (sin teléfonos, enlaces ni datos bancarios)',consent:'Acepto el tratamiento de mi correo y mensaje y que, tras revisión, puedan compartirse con el titular de este anuncio para responder a mi solicitud.',send:'Enviar para revisión',success:'Solicitud recibida para revisión manual. No es una reserva ni un contrato.',fail:'No se pudo enviar. Comprueba tus datos y vuelve a intentarlo.',close:'Cerrar'},
  en:{cta:'Request contact (human review)',heading:'Ask about this listing',details:'Only the moderation team receives your email and message. After reviewing it, we may share your enquiry and email address with the listing owner so they can respond. Replies and bookings are not guaranteed.',email:'Your email',message:'Message (no phone numbers, links or bank details)',consent:'I consent to the processing of my email and message and, after review, sharing them with the listing owner to reply to my request.',send:'Send for review',success:'Request received for human review. This is not a booking or contract.',fail:'Could not send. Check your details and try again.',close:'Close'},
  de:{cta:'Kontakt anfragen (manuelle Prüfung)',heading:'Zum Eintrag Kontakt anfragen',details:'Nur das Moderationsteam erhält zunächst deine E-Mail-Adresse und Nachricht. Nach Prüfung können wir deine Anfrage samt E-Mail-Adresse an den Anbieter weitergeben. Eine Antwort oder Beauftragung ist nicht garantiert.',email:'Deine E-Mail-Adresse',message:'Nachricht (ohne Telefonnummern, Links und Bankdaten)',consent:'Ich bin einverstanden, dass meine E-Mail-Adresse und Nachricht verarbeitet und nach Prüfung an den Anbieter zur Beantwortung meiner Anfrage weitergegeben werden dürfen.',send:'Zur Prüfung senden',success:'Anfrage zur manuellen Prüfung erhalten. Dies ist keine Buchung und kein Vertrag.',fail:'Nachricht konnte nicht gesendet werden. Bitte Eingaben prüfen und erneut versuchen.',close:'Schließen'},
  fr:{cta:'Demander un contact (vérification manuelle)',heading:'Contacter à propos de cette annonce',details:"Seule l'équipe de modération reçoit d'abord votre courriel et votre message. Après vérification, nous pouvons les transmettre à l'auteur de l'annonce. Une réponse ou une réservation n'est pas garantie.",email:'Votre adresse e-mail',message:'Message (sans téléphone, lien ni coordonnées bancaires)',consent:"J'accepte le traitement de mon adresse et message et leur transmission après vérification à l'auteur de l'annonce pour répondre à ma demande.",send:'Envoyer pour vérification',success:"Demande reçue pour vérification humaine. Ce n'est pas une réservation.",fail:"Envoi impossible. Vérifiez vos informations et réessayez.",close:'Fermer'},
  ht:{cta:'Mande kontak (verifikasyon manyèl)',heading:'Mande enfòmasyon sou anons sa a',details:'Se ekip moderasyon an sèlman ki resevwa imel ak mesaj ou an premye. Apre verifikasyon, nou ka pataje yo ak moun ki mete anons la pou li reponn. Pa gen garanti repons ni kontra.',email:'Adrès imel ou',message:'Mesaj (san nimewo telefòn, lyen oswa enfòmasyon bankè)',consent:'Mwen dakò pou yo trete imel ak mesaj mwen epi, apre verifikasyon, pataje yo ak moun ki mete anons la pou reponn demann mwen.',send:'Voye pou verifikasyon',success:'Nou resevwa demann ou pou verifikasyon. Sa pa yon kontra.',fail:'Nou pa ka voye mesaj la. Verifye done yo epi eseye ankò.',close:'Fèmen'}
 };
 const t=copy[lang]||copy.es;
 let available;
 const ready=async()=>{
  if(available!==undefined)return available;
  try{const r=await fetch('/api/config',{cache:'no-store'});if(!r.ok)return available=false;
   const x=await r.json();return available=x.contactRequestsEnabled===true&&typeof x.turnstileSiteKey==='string'&&!!x.turnstileSiteKey}
  catch{return available=false}
 };
 const dialog=document.createElement('dialog');dialog.className='od-contact-dialog';
 const form=document.createElement('form');form.className='od-contact-form';
 const title=document.createElement('h2');title.textContent=t.heading;
 const details=document.createElement('p');details.textContent=t.details;
 const emailLabel=document.createElement('label');emailLabel.textContent=t.email;
 const email=document.createElement('input');email.type='email';email.required=true;email.maxLength=254;email.autocomplete='email';emailLabel.append(email);
 const messageLabel=document.createElement('label');messageLabel.textContent=t.message;
 const message=document.createElement('textarea');message.required=true;message.minLength=15;message.maxLength=1200;messageLabel.append(message);
 const consentLabel=document.createElement('label');consentLabel.className='od-contact-consent';
 const consent=document.createElement('input');consent.type='checkbox';consent.required=true;consentLabel.append(consent,document.createTextNode(t.consent));
 const captcha=document.createElement('div');captcha.className='od-contact-captcha';
 const status=document.createElement('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const actions=document.createElement('div');actions.className='od-contact-actions';
 const close=document.createElement('button');close.type='button';close.textContent=t.close;
 const send=document.createElement('button');send.type='submit';send.textContent=t.send;send.disabled=true;
 actions.append(close,send);form.append(title,details,emailLabel,messageLabel,consentLabel,captcha,actions,status);
 dialog.append(form);document.body.append(dialog);
 let listing=null,widget=null,key=null;
 close.onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{send.disabled=true;status.textContent='';});
 function loadTurnstile(){
  return new Promise((resolve,reject)=>{
   if(window.turnstile)return resolve(window.turnstile);
   const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
   script.async=true;script.onload=()=>resolve(window.turnstile);script.onerror=()=>reject(Error('TURNSTILE_LOAD'));
   document.head.append(script);
  });
 }
 async function open(id){
  if(!await ready())return;
  listing=id;form.reset();status.textContent='';send.disabled=true;dialog.showModal();
  try{const r=await fetch('/api/config',{cache:'no-store'});const config=await r.json();
   if(!config.contactRequestsEnabled||!config.turnstileSiteKey)throw Error('CONTACT_CLOSED');
   const ts=await loadTurnstile();if(!dialog.open||!ts) return;
   if(widget!==null)ts.remove(widget);captcha.replaceChildren();
   key=config.turnstileSiteKey;widget=ts.render(captcha,{sitekey:key});
   send.disabled=false;
  }catch{status.textContent=t.fail}
 }
 form.onsubmit=async event=>{
  event.preventDefault();send.disabled=true;status.textContent='';
  const token=window.turnstile&&widget!==null?window.turnstile.getResponse(widget):'';
  if(!token){status.textContent=t.fail;send.disabled=false;return}
  try{const r=await fetch('/api/contact-requests',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
   submissionId:listing,senderEmail:email.value.trim(),message:message.value.trim(),consent:consent.checked,turnstileToken:token
  })});
   if(!r.ok)throw Error('CONTACT_FAILED');
   form.reset();send.disabled=true;status.textContent=t.success;
  }catch{status.textContent=t.fail;send.disabled=false;
   if(window.turnstile&&widget!==null)window.turnstile.reset(widget)}
 };
 window.oficioContact={
  ready,
  attach:(article,id)=>{
   if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(id||''))return;
   const button=document.createElement('button');button.type='button';button.className='od-contact-button';button.textContent=t.cta;
   button.onclick=()=>open(id);article.append(button);
  }
 };
})();
