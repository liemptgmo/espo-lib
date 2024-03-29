define("views/import/record/detail", ["exports", "views/record/detail"], function (_exports, _detail) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _detail = _interopRequireDefault(_detail);
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

  class ImportDetailRecordView extends _detail.default {
    readOnly = true;
    returnUrl = '#Import/list';
    checkInterval = 5;
    resultPanelFetchLimit = 10;
    duplicateAction = false;
    setup() {
      super.setup();
      this.fetchCounter = 0;
      this.setupChecking();
      this.hideActionItem('delete');
    }
    setupChecking() {
      if (!this.model.has('status')) {
        this.listenToOnce(this.model, 'sync', this.setupChecking.bind(this));
        return;
      }
      if (!~['In Process', 'Pending', 'Standby'].indexOf(this.model.get('status'))) {
        return;
      }
      setTimeout(this.runChecking.bind(this), this.checkInterval * 1000);
      this.on('remove', () => {
        this.stopChecking = true;
      });
    }
    runChecking() {
      if (this.stopChecking) {
        return;
      }
      this.model.fetch().then(() => {
        const isFinished = !~['In Process', 'Pending', 'Standby'].indexOf(this.model.get('status'));
        if (this.fetchCounter < this.resultPanelFetchLimit && !isFinished) {
          this.fetchResultPanels();
        }
        if (isFinished) {
          this.fetchResultPanels();
          return;
        }
        setTimeout(this.runChecking.bind(this), this.checkInterval * 1000);
      });
      this.fetchCounter++;
    }
    fetchResultPanels() {
      const bottomView = this.getView('bottom');
      if (!bottomView) {
        return;
      }
      const importedView = bottomView.getView('imported');
      if (importedView && importedView.collection) {
        importedView.collection.fetch();
      }
      const duplicatesView = bottomView.getView('duplicates');
      if (duplicatesView && duplicatesView.collection) {
        duplicatesView.collection.fetch();
      }
      const updatedView = bottomView.getView('updated');
      if (updatedView && updatedView.collection) {
        updatedView.collection.fetch();
      }
    }
  }
  var _default = ImportDetailRecordView;
  _exports.default = _default;
});
//# sourceMappingURL=detail.js.map ;