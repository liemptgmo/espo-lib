define("views/fields/password", ["exports", "views/fields/base"], function (_exports, _base) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _base = _interopRequireDefault(_base);
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

  class PasswordFieldView extends _base.default {
    type = 'password';
    detailTemplate = 'fields/password/detail';
    editTemplate = 'fields/password/edit';
    validations = ['required', 'confirm'];
    events = {
      /** @this PasswordFieldView */
      'click [data-action="change"]': function () {
        this.changePassword();
      }
    };
    changePassword() {
      this.$el.find('[data-action="change"]').addClass('hidden');
      this.$element.removeClass('hidden');
      this.changing = true;
    }

    /** @inheritDoc */
    data() {
      return {
        isNew: this.model.isNew(),
        ...super.data()
      };
    }

    // noinspection JSUnusedGlobalSymbols
    validateConfirm() {
      if (!this.model.has(this.name + 'Confirm')) {
        return;
      }
      if (this.model.get(this.name) !== this.model.get(this.name + 'Confirm')) {
        let msg = this.translate('fieldBadPasswordConfirm', 'messages').replace('{field}', this.getLabelText());
        this.showValidationMessage(msg);
        return true;
      }
    }
    afterRender() {
      super.afterRender();
      this.changing = false;
      if (this.params.readyToChange) {
        this.changePassword();
      }
    }
    fetch() {
      if (!this.model.isNew() && !this.changing) {
        return {};
      }
      return super.fetch();
    }
  }
  var _default = PasswordFieldView;
  _exports.default = _default;
});
//# sourceMappingURL=password.js.map ;