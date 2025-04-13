import axios from 'axios'
import { useState } from 'react';

export async function postCriarPix(body: any) {
   return await axios.post('https://creative-dane-social.ngrok-free.app/criar-pix',
        {body}
   )
    //.then(response => {
    //   response
   // }).catch(error => {
    //    console.error(error);
    //})
}