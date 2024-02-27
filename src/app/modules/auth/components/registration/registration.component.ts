import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfirmPasswordValidator } from './confirm-password.validator';
import { UserModel } from '../../models/user.model';
import { first, last } from 'rxjs/operators';
import { AddressHTTPService } from '../../services/address-http/adddress-http.service';
import { AddressModel } from '../../models/address.model';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit, OnDestroy {
  registrationForm: FormGroup;
  hasError: boolean;
  isLoading$: Observable<boolean>;
  authToken: any;
  countriesInfo: AddressModel[];
  citiesInfo: AddressModel[];
  selectedIndex: string;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private adddressService: AddressHTTPService,
    private router: Router
  ) {
    this.isLoading$ = this.authService.isLoading$;
    this.isLoading$ = this.adddressService.isLoading$;
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.adddressService.getAddressToken().subscribe((resultToken) => {
      this.authToken = resultToken.auth_token;
      console.log('this.authToken', this.authToken);
      this.adddressService
        .getAddressCountriesInfo(this.authToken)
        .subscribe((result: AddressModel[]) => {
          // Fix: Change AddressModel[] to AddressModel
          this.countriesInfo = result;
          console.log('this.countriesInfo', this.countriesInfo);
        });
    });
  }

  onCountryChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedText =
      selectElement.options[selectElement.selectedIndex].innerText.trim();
    console.log('selectedText', selectedText);
    this.adddressService
      .getAddressCitiesInfo(this.authToken, selectedText)
      .subscribe((result: AddressModel[]) => {
        this.citiesInfo = result;
        console.log('this.citiesInfo', this.citiesInfo);
      });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.registrationForm.controls;
  }

  initForm() {
    this.registrationForm = this.fb.group(
      {
        name: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
          ]),
        ],
        lastName: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
          ]),
        ],
        email: [
          'qwe@qwe.qwe',
          Validators.compose([
            Validators.required,
            Validators.email,
            Validators.minLength(3),
            Validators.maxLength(320), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
          ]),
        ],
        dni: [
          '1234567890',
          Validators.compose([
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(10),
          ]),
        ],
        phoneNumber: [
          '1234567890',
          Validators.compose([
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(10),
          ]),
        ],
        password: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
          ]),
        ],
        cPassword: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
          ]),
        ],
        agree: [false, Validators.compose([Validators.required])],
      },
      {
        validator: ConfirmPasswordValidator.MatchPassword,
      }
    );
  }

  submit() {
    this.hasError = false;
    const result: {
      [key: string]: string;
    } = {};
    Object.keys(this.f).forEach((key) => {
      result[key] = this.f[key].value;
    });
    const newUser = new UserModel();
    newUser.setUser(result);
    const registrationSubscr = this.authService
      .registration(newUser)
      .pipe(first())
      .subscribe((user: UserModel) => {
        if (user) {
          this.router.navigate(['/']);
        } else {
          this.hasError = true;
        }
      });
    this.unsubscribe.push(registrationSubscr);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
