import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { CollapseModule, BsDropdownModule } from "ngx-bootstrap";
import { AngularFontAwesomeModule } from "angular-font-awesome";

import { AppComponent } from "./app.component";
import { AngularFireModule } from "angularfire2";
import { AngularFireAuth } from "angularfire2/auth";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LoginComponent } from "./components/security/login/login.component";
import { HttpClientModule } from "@angular/common/http";
import { RegisterComponent } from "./components/security/register/register.component";
import { EditProfileComponent } from "./components/actor/displayProfile/editProfile.component";
import { AppRoutingModule } from "./app-routing.module";
import { ActorService } from "./services/actor.service";

export const firebaseConfig = {
  apiKey: "AIzaSyAl5P9khAioL85LwBXpAgygjlINpFUPkQk",
  authDomain: "acme-explorer-f6d7d.firebaseapp.com",
  projectId: "acme-explorer-f6d7d",
  storageBucket: "acme-explorer-f6d7d.appspot.com",
  messagingSenderId: "832635498813",
  appId: "1:832635498813:web:36606716e50a3bc6651554",
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    EditProfileComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFontAwesomeModule,
    AngularFireModule.initializeApp(firebaseConfig),
    CollapseModule.forRoot(),
    BsDropdownModule.forRoot(),
    HttpClientModule,
  ],
  providers: [AngularFireAuth, ActorService],
  bootstrap: [AppComponent],
})
export class AppModule {}
