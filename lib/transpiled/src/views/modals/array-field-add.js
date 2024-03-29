define("views/modals/array-field-add", ["exports", "views/modal"], function (_exports, _modal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _modal = _interopRequireDefault(_modal);
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

  class ArrayFieldAddModalView extends _modal.default {
    template = 'modals/array-field-add';
    cssName = 'add-modal';
    backdrop = true;
    data() {
      return {
        optionList: this.optionList,
        translatedOptions: this.translations
      };
    }
    events = {
      /** @this ArrayFieldAddModalView */
      'click .add': function (e) {
        const value = $(e.currentTarget).attr('data-value');
        this.trigger('add', value);
      },
      /** @this ArrayFieldAddModalView */
      'click input[type="checkbox"]': function (e) {
        const value = $(e.currentTarget).attr('data-value');
        if (e.target.checked) {
          this.checkedList.push(value);
        } else {
          const index = this.checkedList.indexOf(value);
          if (index !== -1) {
            this.checkedList.splice(index, 1);
          }
        }
        this.checkedList.length ? this.enableButton('select') : this.disableButton('select');
      },
      /** @this ArrayFieldAddModalView */
      'keyup input[data-name="quick-search"]': function (e) {
        this.processQuickSearch(e.currentTarget.value);
      }
    };
    setup() {
      this.headerText = this.translate('Add Item');
      this.checkedList = [];
      this.translations = Espo.Utils.clone(this.options.translatedOptions || {});
      this.optionList = this.options.options || [];
      this.optionList.forEach(item => {
        if (item in this.translations) {
          return;
        }
        this.translations[item] = item;
      });
      this.buttonList = [{
        name: 'select',
        style: 'danger',
        label: 'Select',
        disabled: true,
        onClick: () => {
          this.trigger('add-mass', this.checkedList);
        }
      }, {
        name: 'cancel',
        label: 'Cancel'
      }];
    }
    afterRender() {
      this.$noData = this.$el.find('.no-data');
      setTimeout(() => {
        this.$el.find('input[data-name="quick-search"]').focus();
      }, 100);
    }
    processQuickSearch(text) {
      text = text.trim();
      const $noData = this.$noData;
      $noData.addClass('hidden');
      if (!text) {
        this.$el.find('ul .list-group-item').removeClass('hidden');
        return;
      }
      const matchedList = [];
      const lowerCaseText = text.toLowerCase();
      this.optionList.forEach(item => {
        const label = this.translations[item].toLowerCase();
        for (const word of label.split(' ')) {
          const matched = word.indexOf(lowerCaseText) === 0;
          if (matched) {
            matchedList.push(item);
            return;
          }
        }
      });
      if (matchedList.length === 0) {
        this.$el.find('ul .list-group-item').addClass('hidden');
        $noData.removeClass('hidden');
        return;
      }
      this.optionList.forEach(item => {
        const $row = this.$el.find(`ul .list-group-item[data-name="${item}"]`);
        if (!~matchedList.indexOf(item)) {
          $row.addClass('hidden');
          return;
        }
        $row.removeClass('hidden');
      });
    }
  }
  var _default = ArrayFieldAddModalView;
  _exports.default = _default;
});
//# sourceMappingURL=array-field-add.js.map ;