define("views/lead-capture/fields/phone-number-country", ["exports", "views/fields/enum", "intl-tel-input-globals"], function (_exports, _enum, _intlTelInputGlobals) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _enum = _interopRequireDefault(_enum);
  _intlTelInputGlobals = _interopRequireDefault(_intlTelInputGlobals);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /************************************************************************
   * This file is part of EspoCRM.
   *
   * EspoCRM – Open Source CRM application.
   * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
   * Website: https://www.espocrm.com
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Affero General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   * GNU Affero General Public License for more details.
   *
   * You should have received a copy of the GNU Affero General Public License
   * along with this program. If not, see <https://www.gnu.org/licenses/>.
   *
   * The interactive user interfaces in modified source and object code versions
   * of this program must display Appropriate Legal Notices, as required under
   * Section 5 of the GNU Affero General Public License version 3.
   *
   * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
   * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
   ************************************************************************/

  // noinspection NpmUsedModulesInstalled

  class LeadCapturePhoneNumberCountry extends _enum.default {
    setupOptions() {
      this.params.options = ['', ..._intlTelInputGlobals.default.getCountryData().map(item => item.iso2)];
      this.translatedOptions = _intlTelInputGlobals.default.getCountryData().reduce((map, item) => {
        map[item.iso2] = `${item.iso2.toUpperCase()} +${item.dialCode}`;
        return map;
      }, {});
    }
  }
  var _default = LeadCapturePhoneNumberCountry;
  _exports.default = _default;
});
//# sourceMappingURL=phone-number-country.js.map ;