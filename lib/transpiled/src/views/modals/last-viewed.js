define("views/modals/last-viewed", ["exports", "views/modal"], function (_exports, _modal) {
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

  class LastViewedModalView extends _modal.default {
    scope = 'ActionHistoryRecord';
    className = 'dialog dialog-record';
    template = 'modals/last-viewed';
    backdrop = true;
    setup() {
      this.events['click .list .cell > a'] = () => {
        this.close();
      };
      this.$header = $('<a>').attr('href', '#LastViewed').attr('data-action', 'listView').addClass('action').text(this.getLanguage().translate('LastViewed', 'scopeNamesPlural'));
      this.waitForView('list');
      this.getCollectionFactory().create(this.scope, collection => {
        collection.maxSize = this.getConfig().get('recordsPerPage');
        collection.url = 'LastViewed';
        this.collection = collection;
        this.loadList();
        collection.fetch();
      });
    }

    // noinspection JSUnusedGlobalSymbols
    actionListView() {
      this.getRouter().navigate('#LastViewed', {
        trigger: true
      });
      this.close();
    }
    loadList() {
      const viewName = this.getMetadata().get('clientDefs.' + this.scope + '.recordViews.listLastViewed') || 'views/record/list';
      this.listenToOnce(this.collection, 'sync', () => {
        this.createView('list', viewName, {
          collection: this.collection,
          fullSelector: this.containerSelector + ' .list-container',
          selectable: false,
          checkboxes: false,
          massActionsDisabled: true,
          rowActionsView: false,
          searchManager: this.searchManager,
          checkAllResultDisabled: true,
          buttonsDisabled: true,
          headerDisabled: true,
          layoutName: 'listForLastViewed',
          layoutAclDisabled: true
        });
      });
    }
  }

  // noinspection JSUnusedGlobalSymbols
  var _default = LastViewedModalView;
  _exports.default = _default;
});
//# sourceMappingURL=last-viewed.js.map ;