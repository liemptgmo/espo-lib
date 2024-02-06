define("views/admin/entity-manager/index", ["exports", "view", "views/admin/entity-manager/modals/export"], function (_exports, _view, _export) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _view = _interopRequireDefault(_view);
  _export = _interopRequireDefault(_export);
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

  class EntityManagerIndexView extends _view.default {
    template = 'admin/entity-manager/index';
    scopeDataList = null;
    scope = null;
    data() {
      return {
        scopeDataList: this.scopeDataList
      };
    }
    events = {
      /** @this EntityManagerIndexView */
      'click button[data-action="createEntity"]': function () {
        this.getRouter().navigate('#Admin/entityManager/create&', {
          trigger: true
        });
      },
      /** @this EntityManagerIndexView */
      'keyup input[data-name="quick-search"]': function (e) {
        this.processQuickSearch(e.currentTarget.value);
      }
    };
    setupScopeData() {
      this.scopeDataList = [];
      let scopeList = Object.keys(this.getMetadata().get('scopes')).sort((v1, v2) => {
        return v1.localeCompare(v2);
      });
      let scopeListSorted = [];
      scopeList.forEach(scope => {
        var d = this.getMetadata().get('scopes.' + scope);
        if (d.entity && d.customizable) {
          scopeListSorted.push(scope);
        }
      });
      scopeList.forEach(scope => {
        var d = this.getMetadata().get('scopes.' + scope);
        if (d.entity && !d.customizable) {
          scopeListSorted.push(scope);
        }
      });
      scopeList = scopeListSorted;
      scopeList.forEach(scope => {
        let d = /** @type {Object.<string, *>} */this.getMetadata().get('scopes.' + scope);
        let isRemovable = !!d.isCustom;
        if (d.isNotRemovable) {
          isRemovable = false;
        }
        let hasView = d.customizable;
        this.scopeDataList.push({
          name: scope,
          isCustom: d.isCustom,
          isRemovable: isRemovable,
          hasView: hasView,
          type: d.type,
          label: this.getLanguage().translate(scope, 'scopeNames'),
          layouts: d.layouts
        });
      });
    }
    setup() {
      this.setupScopeData();
      this.addActionHandler('export', () => this.actionExport());
    }
    afterRender() {
      this.$noData = this.$el.find('.no-data');
      this.$el.find('input[data-name="quick-search"]').focus();
    }
    updatePageTitle() {
      this.setPageTitle(this.getLanguage().translate('Entity Manager', 'labels', 'Admin'));
    }
    processQuickSearch(text) {
      text = text.trim();
      let $noData = this.$noData;
      $noData.addClass('hidden');
      if (!text) {
        this.$el.find('table tr.scope-row').removeClass('hidden');
        return;
      }
      let matchedList = [];
      let lowerCaseText = text.toLowerCase();
      this.scopeDataList.forEach(item => {
        let matched = false;
        if (item.label.toLowerCase().indexOf(lowerCaseText) === 0 || item.name.toLowerCase().indexOf(lowerCaseText) === 0) {
          matched = true;
        }
        if (!matched) {
          let wordList = item.label.split(' ').concat(item.label.split(' '));
          wordList.forEach(word => {
            if (word.toLowerCase().indexOf(lowerCaseText) === 0) {
              matched = true;
            }
          });
        }
        if (matched) {
          matchedList.push(item.name);
        }
      });
      if (matchedList.length === 0) {
        this.$el.find('table tr.scope-row').addClass('hidden');
        $noData.removeClass('hidden');
        return;
      }
      this.scopeDataList.map(item => item.name).forEach(scope => {
        if (!~matchedList.indexOf(scope)) {
          this.$el.find('table tr.scope-row[data-scope="' + scope + '"]').addClass('hidden');
          return;
        }
        this.$el.find('table tr.scope-row[data-scope="' + scope + '"]').removeClass('hidden');
      });
    }
    actionExport() {
      const view = new _export.default();
      this.assignView('dialog', view).then(() => {
        view.render();
      });
    }
  }
  var _default = EntityManagerIndexView;
  _exports.default = _default;
});
//# sourceMappingURL=index.js.map ;