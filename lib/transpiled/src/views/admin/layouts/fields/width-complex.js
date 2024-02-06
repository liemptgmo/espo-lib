define("views/admin/layouts/fields/width-complex", ["exports", "views/fields/base", "views/fields/enum", "model", "views/fields/float"], function (_exports, _base, _enum, _model, _float) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _base = _interopRequireDefault(_base);
  _enum = _interopRequireDefault(_enum);
  _model = _interopRequireDefault(_model);
  _float = _interopRequireDefault(_float);
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

  class LayoutWidthComplexFieldView extends _base.default {
    editTemplateContent = `
        <div class="row">
            <div data-name="value" class="col-sm-6">{{{value}}}</div>
            <div data-name="unit" class="col-sm-6">{{{unit}}}</div>
        </div>

    `;
    getAttributeList() {
      return ['width', 'widthPx'];
    }
    setup() {
      this.auxModel = new _model.default();
      this.syncAuxModel();
      this.listenTo(this.model, 'change', () => this.syncAuxModel());
      const unitView = new _enum.default({
        name: 'unit',
        mode: 'edit',
        model: this.auxModel,
        params: {
          options: ['%', 'px']
        }
      });
      const valueView = new _float.default({
        name: 'value',
        mode: 'edit',
        model: this.auxModel
      });
      this.assignView('unit', unitView, '[data-name="unit"]');
      this.assignView('value', valueView, '[data-name="value"]');
      this.listenTo(this.auxModel, 'change', (m, o) => {
        if (!o.ui) {
          return;
        }
        this.model.set(this.fetch(), {
          ui: true
        });
      });
    }
    fetch() {
      if (this.auxModel.get('unit') === 'px') {
        return {
          width: null,
          widthPx: this.auxModel.get('value')
        };
      }
      return {
        width: this.auxModel.get('value'),
        widthPx: null
      };
    }
    syncAuxModel() {
      const width = this.model.get('width');
      const widthPx = this.model.get('widthPx');
      const unit = width || !widthPx ? '%' : 'px';
      this.auxModel.set({
        unit: unit,
        value: unit === 'px' ? widthPx : width
      });
    }
  }

  // noinspection JSUnusedGlobalSymbols
  var _default = LayoutWidthComplexFieldView;
  _exports.default = _default;
});
//# sourceMappingURL=width-complex.js.map ;