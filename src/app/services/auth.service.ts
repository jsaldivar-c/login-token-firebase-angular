import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioModel } from '../models/usuario.model';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private url = ' https://identitytoolkit.googleapis.com/v1';
    private apiKey = 'gffsfssfsfsfsftrtr';
    private userToken: string;

    constructor(private http: HttpClient) {
        this.leerToken();
    }

    logOut() {
        localStorage.removeItem('token');
    }

    logIn(usuario: UsuarioModel) {
        const authData = {
            ...usuario,
            returnSecureToken: true,
        };

        return this.http
            .post(
                `${this.url}/accounts:signInWithPassword?key=${this.apiKey}`,
                authData
            )
            .pipe(
                map((resp) => {
                    console.log('Entro en el mapa del RXJS');
                    // tslint:disable-next-line: no-string-literal
                    this.guardarToken(resp['idToken']);
                    return resp;
                })
            );
    }

    nuevoUsuario(usuario: UsuarioModel) {
        // const authData = {
        //   email: usuario.email;
        //   password: usuario.password;
        //   returnSecureToken: true;
        // }

        // Forma resumida con el operador Spread.
        const authData = {
            ...usuario,
            returnSecureToken: true,
        };

        return (
            this.http
                .post(
                    `${this.url}/accounts:signUp?key=${this.apiKey}`,
                    authData
                )
                /* Creamos un observable para que se ejecute en caso de que se cree el nuevo usuario,
                caso contrario no se guardara el Token.*/
                .pipe(
                    map((resp) => {
                        console.log('Entro en el mapa del RXJS');
                        // tslint:disable-next-line: no-string-literal
                        this.guardarToken(resp['idToken']);
                        return resp;
                    })
                )
        );
    }

    private guardarToken(idToken: string) {
        this.userToken = idToken;
        localStorage.setItem('token', idToken);

        const hoy = new Date();
        hoy.setSeconds(3600);
        localStorage.setItem('expira', hoy.getTime().toString());
    }

    leerToken() {
        if (localStorage.getItem('token')) {
            this.userToken = localStorage.getItem('token');
        } else {
            this.userToken = '';
        }

        return this.userToken;
    }

    estaAutenticado(): boolean {
        if (this.userToken.length < 2) {
            return false;
        }
        const expira = Number(localStorage.getItem('expira'));
        const expiraDate = new Date();
        expiraDate.setTime(expira);

        if (expiraDate > new Date()) {
            return true;
        } else {
            return false;
        }
    }
}
