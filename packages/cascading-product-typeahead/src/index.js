/* eslint-disable */
import React from "react";

import { I18nProvider } from "@lingui/react";

// Importing the configurations from config file
import {
  catalogs,
  defaultLocale,
  setI18nLocale,
  geti18n,
  i18n
} from "./integrations/i18n.config";

// Trans is used for translation
import { Trans, t } from "@lingui/macro";

import PropTypes from "prop-types";
import styled from "styled-components";
import Label from "@hig/label";
import ProgressRing from "@hig/progress-ring";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes, faAngleDown, faAngleUp
} from "@fortawesome/free-solid-svg-icons";
import getProductTypeaheadData from "./services";
import HIGLightGrayTheme from "@hig/theme-data/build/esm/lightGrayMediumDensityTheme";
import GlobalStyles from "./assets/GlobalStyles"
import ThemeContext from "@hig/theme-context";
import { decode } from 'html-entities';

const UUID = require("uuid");

const SeparatorDiv = styled.div`
  margin-left: -10px !important;
  position: relative;
  width: calc(100% + 20px);
  margin-top: 5px;
`;
const TypeAheadInputWrapper = styled.div(props => ({
  borderRadius: props.inputStyle === "box" ? "0px" : "30px",
  border: "1px solid #eee",
  borderBottom: props.productVersionSelected == false ? "none" : "1px solid #eee",
  height: "auto",
  lineHeight: "0rem",
  padding: "10px"
}));
const PosRelative = styled.div`
  position: relative;
  font-family: "ArtifaktElement";
  input,
  [contenteditable] {
    font-family: "ArtifaktElement" !important;
    font-size: 14px !important;
    caret-color: #0696d7;
    border: none !important;
    outline: none !important;
    margin-bottom: 0px !important;
    transition: none !important;
    padding: 0px !important;
    height: 18px !important;
  }
  input::-ms-clear {
    display: none;
    height: 0;
    width: 0;
  }
  input:focus {
    box-shadow: none !important;
    border-color: transparent !important;
    outline: none !important;
    background: none !important;
  }
`;

const TypeaheadInput = styled.input`
  background: transparent;
  width: calc(100% - 35px);
  outline: none;
  border: none;
  padding: 0px;
  height: 18px;
  position: relative;
  color: #3C3C3C !important;
`;

const TypeaheadItemWrapper = styled.div`
  font-family: "ArtifaktElement";
  border: 1px solid #eee;
  border-top: unset;
`;

const TypeaheadItemHeightWrapper= styled.div`
  max-height: 200px;
  overflow-y : scroll;

  ::-webkit-scrollbar {
    width: 5px;
    background-color: linear-gradient(to bottom, #f5f5f5 0%, #eeeeee 60%);
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 50px;
    min-height: 125px;
    box-shadow: inset 0 0 6px rgba(35, 33, 33, 0.2);
    background-color: $rgba(146, 143, 143, 0.1607843137254902);;

    &:hover {
      background-color: #999999;
    }
  }
`;

const TypeAheadItem = styled.div`
  color: #2A2A2A !important;
  margin-left: -10px;
  font-weight: 500;
  cursor: pointer;
  font-size: 14px;
  a {
    padding: 10px 20px 10px 20px;
    display: block;
    border: none !important;
  }
`;

const TypeAheadActiveItem = styled.div`
  a {
    color: #2A2A2A !important;
    padding: 10px;
    display: block;
    border: none !important;
  }
  cursor: pointer;
  font-size: 14px;
  background: rgba(128, 128, 128, 0.12);
`;
const NoProducts = styled.div`
  margin-left: 10px;
  font-size: 14px;
  color: #3C3C3C !important;
`;
const BrowseProducts = styled.div`
  color: #0696d7;
  padding-left: 10px;
  padding-bottom: 10px;
  cursor: pointer;
  font-size: 14px;
`;
const ClearIcon = styled.div`
  cursor: pointer;
  color: #0696d7;
  position: absolute;
  bottom: -9.5px;
  right: -10px;
  padding: 10px;
  height: 16px;
  width: 22px;
  box-sizing: unset;
  svg {
    margin-top: 0px;
    font-size: 16px;
    margin-left: 5px;
  }

`;
export default class CascadingSequenceProductTypeahead extends React.Component {
  constructor(props) {
    super(props);
    const id = UUID.v4();
    this.state = {
      typeAheadInputHint: "",
      resultArray: [],
      typeAheadInput: this.props.productName ? this.props.productName : "",
      productMatch: false,
      productMatchArray: [],
      selectedData: {},
      id,
      products: [],
      hideInputHint: false,
      typeAheadInputHintIndex: 0,
      typeAheadInputHintVersionIndex: 0,
      productsLoaded: false,
      errorLoadingData: false,
      dataSource: "",
      dropDownOpened: false,
      productVersionSelected: false,
      arrowDownClicked: false,
      arrowUpTextData: ''
    };
    this.selectProductName = this.selectProductName.bind(this);
  }

  componentWillMount = () => {
    const { productData, scrollToBottom } = this.props;
    if (productData && productData.length > 0) {
      this.setState({
        productsLoaded: true
      });
      this.productDataStore = productData;
      this.setState({
        products: productData,
        productsLoaded: true
      });
      if (this.props.productName) {
        setTimeout(() => {
          this.handleInputChange(this.props.productName);
          if (scrollToBottom) {
            scrollToBottom();
          }
        }, 1);
      }
      if (scrollToBottom) {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    }
  };

  componentDidMount = () => {
    const {
      failure_callback,
      showOnlyTrialProducts,
      scrollToBottom,
      env,
      isTypeaheadLoading,
      title,
      hideVersionDisplay
    } = this.props;
    const requestId = UUID.v4();
    if (!this.state.productsLoaded && !isTypeaheadLoading) {
      getProductTypeaheadData(
        { showOnlyTrialProducts: showOnlyTrialProducts, requestId: requestId },
        env
      )
        .then(response => {
          if (response.data !== null) {
            this.productDataStore = response.data.getCascadingSequenceProductData.productData;
            if (hideVersionDisplay) {
              this.productDataStore = this.productDataStore.filter(item => {
                return item.productVersions = []
              })
            }
            this.setState({
              products: this.productDataStore,
              productsLoaded: true,
              dataSource: response.data.getCascadingSequenceProductData.dataSource
            });
            if (this.props.productName) {
              setTimeout(() => {
                this.handleInputChange(this.props.productName);
                if (scrollToBottom) {
                  scrollToBottom();
                }
              }, 1);
            }
            if (scrollToBottom) {
              setTimeout(() => {
                scrollToBottom();
              }, 100);
            }
            const analyticsResponse = {
              core: {
                request_id: requestId
              },
              title: title,
              type: "react",
              shown_typeahead_params: [{ showOnlyTrialProducts: showOnlyTrialProducts }],
              shown_typeahead_source: this.state.dataSource
            };
          } else {
            if (failure_callback) {
              failure_callback({
                error: "api_failure"
              });
            }
          }
        })
        .catch(error => {
          console.log("error", error);
          this.setState({
            errorLoadingData: true
          });
          if (failure_callback) {
            failure_callback({
              error: "api_failure"
            });
          }
        });
    }
  };

  handleKeyPress = e => {
    // log.debug(e.target.value);
    this.setState({ typeAheadInput: e.target.value });
    if (e.target.value.length <= 0) {
      this.setState({ resultArray: [] });
    }
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    // handling hover function to be called only once
    // log.debug("next state", nextState);
    if (this.state.productMatch != nextState.productMatch) return true;
    if (nextState.typeAheadInput === "") {
      return true;
    }
    if (
      nextState.productMatch &&
      this.state.productMatchArray.length != nextState.productMatchArray.length
    ) {
      return true;
    }
    if (
      nextState.productMatch &&
      this.state.typeAheadInput === nextState.typeAheadInput &&
      nextState.typeAheadInputHintVersionIndex ===
      this.state.typeAheadInputHintVersionIndex
    ) {
      return false;
    }
    if (
      !nextState.productMatch &&
      !this.state.resultArray &&
      this.state.typeAheadInput === nextState.typeAheadInput &&
      nextState.typeAheadInputHintIndex === this.state.typeAheadInputHintIndex
    ) {
      //   log.debug("next state first", nextState);
      return false;
    }

    return true;
  };

  handleKeyDown = e => {
    // log.debug(e.key, this.state.productMatch);
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      if (!this.state.productMatch) {
        let product = this.state.resultArray[
          this.state.typeAheadInputHintIndex
        ];
        if (product.productVersions.length > 0) {
          this.selectProductName(
            this.state.resultArray[this.state.typeAheadInputHintIndex]
          );
        } else {
          this.selectProductWithoutVersion(product);
        }
        let value = this.state.resultArray[this.state.typeAheadInputHintIndex]
          .productName;
        this.showVersionsOnProductSelection(value);
      } else {
        this.selectProductVersionName(
          this.state.productMatchArray[0].productVersions[
          this.state.typeAheadInputHintVersionIndex
          ]
        );
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this.handleArrowDown();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.handleArrowUp();
    }
  };
  showVersionsOnProductSelection = productName => {
    let tempResultArray = this.checkForProductMatch(productName);
    if (tempResultArray.length > 0) {
      for (let i = 0; i < tempResultArray.length; i++) {
        if (
          tempResultArray[i].productName.toLowerCase() ===
          productName.toLowerCase()
        ) {
          const tempMatchArray = [];
          tempMatchArray.push(tempResultArray[i]);
          this.setState({
            productMatch: true,
            productMatchArray: tempMatchArray,
            dropDownOpened: false,
            resultArray: []
          });
          if (tempResultArray[i].productVersions.length > 0) {
            this.setState({
              typeAheadInputHint:
                tempMatchArray[0].productVersions[0].versionName
            });
          } else {
            this.setState({
              typeAheadInputHint: tempMatchArray[0].productName
            });
          }
          break;
        } else {
          this.setState({
            productMatch: false,
            productMatchArray: [],
            noProducts: false
          });
        }
      }
    }
  };

  handleArrowUp = () => {
    // log.debug("ArrowUp");
    if (!this.state.productMatch) {
      if(this.state.typeAheadInputHintIndex>=4) {
        let typeaheadScrollNodes = [];
        if (document.getElementById('TypeaheadItemHeightWrapper')) {
          typeaheadScrollNodes = document.getElementById('TypeaheadItemHeightWrapper');
          setTimeout(() => {
            typeaheadScrollNodes.scrollTop -= 40;
          }, 1);
        }
      }
      const typeAheadInputHintIndex =
        this.state.typeAheadInputHintIndex > 0 &&
          !(this.state.typeAheadInputHintIndex - 1 < 0)
          ? this.state.typeAheadInputHintIndex - 1
          : 0;
      this.setState({
        typeAheadInputHintIndex,
        typeAheadInputHint: this.state.resultArray[typeAheadInputHintIndex]
          .productName
      });
    } else {
      if(this.state.typeAheadInputHintVersionIndex >= 4) {
        let typeaheadScrollNodes = [];
        if (document.getElementById('TypeaheadItemHeightWrapper')) {
          typeaheadScrollNodes = document.getElementById('TypeaheadItemHeightWrapper');
          setTimeout(() => {
            typeaheadScrollNodes.scrollTop -= 40;
          }, 1);
        }
      }
      const typeAheadInputHintIndex =
        this.state.typeAheadInputHintVersionIndex > 0
          ? this.state.typeAheadInputHintVersionIndex - 1
          : 0;
      if (typeAheadInputHintIndex >= 0) {
        this.setState({
          typeAheadInputHintVersionIndex: typeAheadInputHintIndex,
          typeAheadInputHint: this.state.productMatchArray[0]?.productVersions[
            typeAheadInputHintIndex
          ].versionName
        });
      }
    }
    setTimeout(() => {
      this.handleTypeAheadInputCase();
    }, 1);
  };

  handleTypeAheadInputCase = () => {
    let typeAheadInput;
    // changing cases in typeahead input
    if (!this.state.productMatch) {
      typeAheadInput = this.state.resultArray[
        this.state.typeAheadInputHintIndex
      ]?.productName?.substring(0, this.state.typeAheadInput.length);
    } else {
      typeAheadInput = this.state.productMatchArray[0]?.productVersions[
        this.state.typeAheadInputHintVersionIndex
      ]?.versionName?.substring(0, this.state.typeAheadInput.length);
    }
  };

  handleArrowDown = () => {
    // log.debug("ArrowDown", this.state);

    if (!this.state.productMatch) {
      if(this.state.typeAheadInputHintIndex>=4) {
        let typeaheadScrollNodes = [];
        if (document.getElementById('TypeaheadItemHeightWrapper')) {
          typeaheadScrollNodes = document.getElementById('TypeaheadItemHeightWrapper');
          setTimeout(() => {
            typeaheadScrollNodes.scrollTop += 40;
          }, 1);
        }
      }
      const typeAheadInputHintIndex =
        this.state.typeAheadInputHintIndex < this.state.resultArray.length
          ? this.state.typeAheadInputHintIndex + 1
          : 0;
      if (typeAheadInputHintIndex < this.state.resultArray.length) {
        this.setState({
          typeAheadInputHintIndex,
          typeAheadInputHint: this.state.resultArray[typeAheadInputHintIndex]
            ?.productName
        });
      }
    } else {
      if(this.state.typeAheadInputHintVersionIndex>=4) {
        let typeaheadScrollNodes = [];
        if (document.getElementById('TypeaheadItemHeightWrapper')) {
          typeaheadScrollNodes = document.getElementById('TypeaheadItemHeightWrapper');
          setTimeout(() => {
            typeaheadScrollNodes.scrollTop += 40;
          }, 1);
        }
      }
      const typeAheadInputHintIndex =
        this.state.typeAheadInputHintVersionIndex < this.state.productMatchArray[0]?.productVersions.length
          ? this.state.typeAheadInputHintVersionIndex + 1
          : 0;
      if (
        typeAheadInputHintIndex <
        this.state.productMatchArray[0]?.productVersions.length
      ) {
        this.setState({
          typeAheadInputHintVersionIndex: typeAheadInputHintIndex,
          typeAheadInputHint: this.state.productMatchArray[0]?.productVersions[
            typeAheadInputHintIndex
          ].versionName
        });
      }
    }
    setTimeout(() => {
      this.handleTypeAheadInputCase();
    }, 1);

    // log.debug(this.state, !this.state.typeAheadInputHintIndex < 10);
  };

  handleNoProductsMatch = key => {
    let version = {};
    if (
      this.state.typeAheadInputHint === this.state.typeAheadInput &&
      key === "Enter"
    ) {
      this.productDataStore.filter(item => {
        item.productVersions.filter(i => {
          if (i.versionName === this.state.typeAheadInputHint) {
            this.setState({
              typeAheadInput: i.versionName
            });
            version = i;
          }
        });
      });
      this.selectProductVersionName(version);
    }
    this.productDataStore.filter(item => {
      item.productVersions.filter(i => {
        if (i.versionName === this.state.typeAheadInputHint) {
          this.setState({
            typeAheadInput: i.versionName
          });
          version = i;
        }
      });
    });
    setTimeout(() => {
      this.handleInputChange(this.state.typeAheadInput);
    }, 1);
  };

  handleChange = e => {
    // log.debug("value", e.key);
    if(e.target.value) {
      this.setState({arrowDownClicked: true, productVersionSelected: false});
    } else {
      this.setState({arrowDownClicked: false, productVersionSelected: false});
    }
    this.handleInputChange(e.target.value);
  };

  selectProductName = data => {
    // log.debug("selected product", data);
    /* istanbul ignore next */
    const { ignoreProductMatch, userevent_callback } = this.props;
    if (data) {
      if (this.myinput) this.myinput.focus();
      this.setState({
        typeAheadInput: data.productName,
        typeAheadInputHintIndex: 0
      });
      if (data.productVersions.length === 0) {
        this.selectProductWithoutVersion(data);
      }
      this.handleInputChange(data.productName);
      if (ignoreProductMatch) {
        this.showVersionsOnProductSelection(data.productName);
      }
      if (userevent_callback) {
        userevent_callback({
          type: "product_lookup",
          result: {
            productName: data.productName,
          }
        })
      }
    }
  };

  selectProductWithoutVersion = data => {
    this.setState({
      typeAheadInput: data.productName,
      typeAheadInputHintIndex: 0
    });
  };

  selectProductVersionName = data => {
    // log.debug("selected version", data);
    const { title, userevent_callback } = this.props;
    if (data) {
      let selectedData = {};
      this.productDataStore.filter(item => {
        item.productVersions.filter(i => {
          if (
            data.versionName === i.versionName &&
            data.versionReleaseYear === i.versionReleaseYear
          ) {
            selectedData = item;
          }
          return i;
        });
        return item;
      });
      //   log.debug("selected data", selectedData);
      const analyticsEvent = {
        title: title,
        type: "react",
        shown_typeahead_source: this.state.dataSource,
        submitted_typeahead: {
          search_term: this.state.typeAheadInput,
          prod_name: this.state.typeAheadInput,
          prod_year: data.versionReleaseYear
        }
      };
      if (userevent_callback) {
        userevent_callback({
          type: "version_lookup",
          result: {
            productName: this.state.typeAheadInput,
            productVersion: data.versionReleaseYear,
          }
        })
      }
      this.setState({
        selectedData,
        typeAheadInput: data.versionName,
        productVersionSelected: true
      });
      for(const selected of selectedData.productVersions) {
        if(selected.versionName === data.versionName)
          this.getCascadingSequenceForProduct(selected.cascadingSequence);
      }
      this.myinput.blur();
    }
    setTimeout(() => {
      this.handleInputChange(this.state.typeAheadInput);
    }, 1);
  };

  getCascadingSequenceForProduct = (cascadingSequence) => {
    const { success_callback, failure_callback } = this.props;
    if (cascadingSequence && success_callback) {
      cascadingSequence = cascadingSequence.split(',');
      success_callback({
        cascadingSequence
      });
    } else if (failure_callback) {
      failure_callback({
        type: 'cascading_sequence_not_found',
        cascadingSequence: []
      })
    }
  }

  scrollToBottom = () => {
    let typeaheadNodes = [];
    if (document.querySelector(".typeahead")) {
      typeaheadNodes = document.querySelectorAll(".typeahead");
      if (
        typeaheadNodes[typeaheadNodes.length - 1].contains(
          document.getElementById(this.state.id)
        )
      ) {
        const allLiTags = document.querySelectorAll("li");
        const lastList = allLiTags[allLiTags.length - 1];
        const lastTypeahead = typeaheadNodes[typeaheadNodes.length - 1];
        if (lastList.isEqualNode(lastTypeahead)) {
          setTimeout(() => {
            document.getElementsByClassName("content")[0].scrollTop += 1000;
          }, 1);
        } else {
        }
      }
    }
  };

  checkForProductMatch = value => {
    let tempResultArray = [];
    this.productDataStore.filter(data => {
      const tempProductName = data.productName.toLowerCase();
      if (tempProductName.startsWith(value.toLowerCase())) {
        if (!(tempProductName.toLowerCase() === value.toLowerCase)) {
          let startIndex= tempProductName.indexOf(value.toLowerCase());
          data['nonEmphasizedText'] = data.productName.substring(startIndex+value.length, data.productName.length);
          data['emphasizedText'] = data.productName.substring(0, startIndex+value.length);
          tempResultArray.push(data);
          const typeAheadInput = tempResultArray[0].productName.substring(
            0,
            value.length
          );
          this.setState({
            typeAheadInputHint: tempResultArray[0].productName,
            noProducts: true
          });
        }
      }
      return data;
    });
    return tempResultArray;
  };

  handleInputChange = value => {
    this.setState({ typeAheadInput: value });
    let tempResultArray = [];
    const { ignoreProductMatch, hideVersionDisplay } = this.props;
    tempResultArray = this.checkForProductMatch(value);
    if (value.length <= 0) {
      tempResultArray = [];
      this.setState({
        typeAheadInputHint: "",
        productMatchArray: []
      });
    } else if (tempResultArray.length > 0 && !ignoreProductMatch) {
      for (let i = 0; i < tempResultArray.length; i++) {
        if (
          tempResultArray[i].productName.toLowerCase() === value.toLowerCase()
        ) {
          const tempMatchArray = [];
          tempMatchArray.push(tempResultArray[i]);
          this.setState({
            productMatch: true,
            productMatchArray: tempMatchArray,
            resultArray: [],
            dropDownOpened: false
          });
          if (hideVersionDisplay) {
            this.setState({
              productMatch: false,
              productMatchArray: tempMatchArray,
              resultArray: tempMatchArray,
              dropDownOpened: false
            });
          }
          if (tempResultArray[i].productVersions.length > 0) {
            this.setState({
              typeAheadInputHint:
                tempMatchArray[0].productVersions[0].versionName,
              dropDownOpened: false
            });
          } else {
            this.setState({
              typeAheadInputHint: tempMatchArray[0].productName,
              productMatch: false,
              dropDownOpened: false
            });
          }
          break;
        } else {
          this.setState({
            productMatch: false,
            productMatchArray: [],
            noProducts: false,
            dropDownOpened: false
          });
        }
      }
    } else if (tempResultArray.length > 0 && ignoreProductMatch) {
      //   log.debug("no products found");
      this.setState({
        productMatchArray: [],
        resultArray: tempResultArray,
        productMatch: false,
        dropDownOpened: false
      });
    } else {
      this.setState({
        productMatchArray: [],
        resultArray: [],
        productMatch: false,
        dropDownOpened: false
      });
      this.handleNoProducts(value);
    }
    setTimeout(() => {
      this.setState({
        resultArray: tempResultArray,
        typeAheadInputHintIndex: 0,
        typeAheadInputHintVersionIndex: 0,
        dropDownOpened: false
      });
    }, 100);

    // if (this.props.scrollToBottom) {
    //   this.props.scrollToBottom();
    // }
  };

  handleNoProducts = value => {
    // log.debug("handle no products", value);
    const tempData = this.state.products;
    tempData.filter(item => {
      const tempVersionMatchArray = [];
      let match = false;
      item.productVersions.filter(i => {
        if (i.versionName.toLowerCase().startsWith(value.toLowerCase())) {
          tempVersionMatchArray.push(i);
          match = true;
        }
      });
      const temp = {
        productLineCode: item.productLineCode,
        productName: item.productName,
        productVersions: {}
      };
      temp.productVersions = tempVersionMatchArray;
      if (match) {
        // log.debug(item);
        const tempArray = [];
        tempArray.push(temp);
        const typeAheadInputHint = tempArray[0].productVersions[0].versionName;
        this.setState({
          productMatchArray: tempArray,
          productMatch: true,
          typeAheadInputHint
        });
      }
    });
  };

  clearInput = () => {
    this.setState({
      typeAheadInput: "",
      typeAheadInputHint: "",
      resultArray: [],
      productMatchArray: [],
      dropDownOpened: false
    });
  };

  dropDownOptions = () => {
    if(!this.state.typeAheadInput) {
      if(!this.state.dropDownOpened) {
      this.setState({
        productMatch: false,
        productMatchArray: this.productDataStore,
        resultArray: this.productDataStore,
        dropDownOpened: true,
      });
      if (this.myinput) this.myinput.focus();
      } else {
        this.setState({
          productMatch: false,
          productMatchArray: [],
          resultArray: [],
          dropDownOpened: false,
        });
      }
    }
  }

  browseList = () => {
    const { title, userevent_callback } = this.props;
    if (userevent_callback) {
      userevent_callback({
        type: 'link_click',
        result: {
          linkText: i18n._('viewAvailDownloads'),
          linkTextEnglish: 'Contact Support',
          href: 'https://wordpress.org/plugins/js-support-ticket/'
        }
      })
    }
  };

  handleHover = index => {
    // log.debug("hover");
    this.setState({
      typeAheadInputHintIndex: index
    });
  };

  handleVersionHover = index => {
    this.setState({
      typeAheadInputHintVersionIndex: index
    });
  };

  render() {
    const {
      typeaheadTitle,
      noProductsFoundText,
      browseText,
      inputStyle,
      lang,
      flow,
      hideVersionDisplay
    } = this.props;
    const { errorLoadingData } = this.state;
    setI18nLocale(lang);
    const angleDownStyle = {
      'color': 'black',
      'font-weight': '100',
      'margin-top': '0px',
      'font-size': '16px',
      'margin-left': '5px'
    };
    return (
      <ThemeContext.Provider value={HIGLightGrayTheme}>
        <I18nProvider language={lang} catalogs={catalogs}>
          <GlobalStyles/>
          {!errorLoadingData && (
            <div>
              {" "}
              {!this.state.productsLoaded && <ProgressRing size="m" />}
              {this.state.productsLoaded && (
                <div id={this.state.id} className="typeahead-wrapper">
                  <Label style={{ color: "#000000" }}>
                    <strong>
                      Which product cascading sequence do you need?
                    </strong>
                  </Label>
                  <SeparatorDiv />
                  <TypeAheadInputWrapper inputStyle={inputStyle} productVersionSelected={this.state.productVersionSelected}>
                    <PosRelative>
                      <TypeaheadInput
                        type="text"
                        placeholder={geti18n()._(t`Enter product names...`)}
                        autoComplete="false"
                        spellCheck="false"
                        onKeyPress={e => this.handleKeyPress(e)}
                        onChange={e => this.handleChange(e)}
                        onKeyDown={e => this.handleKeyDown(e)}
                        value={decode(this.state.typeAheadInput)}
                        ref={input => (this.myinput = input)}
                      />
                      {!this.state.productVersionSelected &&
                        !this.state.arrowDownClicked && (
                        <ClearIcon onClick={() => {this.setState({arrowDownClicked: true, arrowUpTextData: '', dropDownOpened: true}); if (this.myinput) { this.myinput.focus(); } if(this.state.typeAheadInput) {this.handleInputChange(this.state.typeAheadInput);} else {this.dropDownOptions()}}}>
                          {/* <i class="fa fa-angle-down" style={angleDownStyle}></i> */}
                          <FontAwesomeIcon style={angleDownStyle} icon={faAngleDown} />
                        </ClearIcon>
                      )}
                      {!this.state.productVersionSelected &&
                        this.state.arrowDownClicked && (
                        <ClearIcon onClick={() => this.setState({arrowUpTextData: this.state.typeAheadInput, typeAheadInputHintIndex: 0, arrowDownClicked: false, dropDownOpened: false, productMatch: false,
                          resultArray: []})}>
                          {/* <i class="fa fa-angle-up" style={angleDownStyle}></i> */}
                          <FontAwesomeIcon style={angleDownStyle} icon={faAngleUp} />
                        </ClearIcon>
                      )}
                      {this.state.productVersionSelected && this.state.typeAheadInput.length > 0 && (
                        <ClearIcon onClick={() => {this.setState({productVersionSelected: false, arrowDownClicked: false, arrowUpTextData: ''}); this.clearInput()}}>
                          <FontAwesomeIcon style={{color : '#666666'}} icon={faTimes} />
                        </ClearIcon>
                      )}
                    </PosRelative>
                  </TypeAheadInputWrapper>
                  {!this.state.productVersionSelected &&
                  <TypeaheadItemWrapper>
                    {!this.state.productMatch &&
                      this.state.resultArray.length > 0 &&
                      <TypeaheadItemHeightWrapper id='TypeaheadItemHeightWrapper'>
                      {this.state.resultArray.map((i, index) => (
                        <div key={UUID.v4()}>
                          {this.state.typeAheadInputHintIndex != index && (
                              <TypeAheadItem key={UUID.v4()}>
                                <a
                                  key={UUID.v4()}
                                  onMouseEnter={e => this.handleHover(index)}
                                  tabIndex="-1"
                                >
                                  {this.state.typeAheadInput && (
                                  <>
                                  <strong>{decode(i.emphasizedText)}</strong>{decode(i.nonEmphasizedText)}
                                  </>
                                  )}
                                  {!this.state.typeAheadInput && (
                                    <>
                                    {decode(i.productName)}
                                    </>
                                  )}
                                </a>
                              </TypeAheadItem>
                            )}
                          {this.state.typeAheadInputHintIndex === index && (
                              <TypeAheadActiveItem
                                onClick={() => this.selectProductName(i)}
                                key={UUID.v4()}
                              >
                                <a key={UUID.v4()} tabIndex="-1">
                                  {this.state.typeAheadInput && (
                                    <>
                                    <strong>{decode(i.emphasizedText)}</strong>{decode(i.nonEmphasizedText)}
                                    </>
                                  )}
                                  {!this.state.typeAheadInput && (
                                    <>
                                    {decode(i.productName)}
                                    </>
                                  )}
                                </a>
                              </TypeAheadActiveItem>
                            )}
                        </div>
                      ))}
                      </TypeaheadItemHeightWrapper>
                      }
                    {this.state.productMatch &&
                      this.state.productMatchArray.length > 0 &&
                      !hideVersionDisplay &&
                      <TypeaheadItemHeightWrapper id='TypeaheadItemHeightWrapper'>
                      {this.state.productMatchArray.map(item =>
                        item.productVersions.map((i, index) => (
                          <div key={UUID.v4()}>
                            {this.state.typeAheadInputHintVersionIndex != index && (
                                <TypeAheadItem key={UUID.v4()}>
                                  <a
                                    key={UUID.v4()}
                                    onMouseEnter={e =>
                                      this.handleVersionHover(index)
                                    }
                                    tabIndex="-1"
                                  >
                                    {decode(i.versionName)}
                                  </a>
                                </TypeAheadItem>
                              )}
                            {!hideVersionDisplay &&
                              this.state.typeAheadInputHintVersionIndex ===
                              index && (
                                <TypeAheadActiveItem
                                  onClick={() => this.selectProductVersionName(i)}
                                  key={UUID.v4()}
                                >
                                  <a
                                    key={UUID.v4()}
                                    onMouseEnter={e =>
                                      this.handleVersionHover(index)
                                    }
                                    tabIndex="-1"
                                  >
                                    {decode(i.versionName)}
                                  </a>
                                </TypeAheadActiveItem>
                              )}
                          </div>
                        ))
                      )}
                      </TypeaheadItemHeightWrapper>
                      }
                    {this.state.arrowUpTextData.length == 0 && this.state.typeAheadInput.length > 0 &&
                      this.state.resultArray.length <= 0 &&
                      this.state.productMatchArray.length <= 0 && (
                        <div>
                          <NoProducts>
                            {noProductsFoundText || (
                              <>
                              <Trans id="productNotAvailable">
                              We couldn't find that product. Please try your search again and choose from the options provided. For more help, 
                                       
                              <a onClick={() => this.browseList()} href='https://wordpress.org/plugins/js-support-ticket/' target="_blank">contact support</a>. </Trans>
                              </>
                            )}
                          </NoProducts>
                        </div>
                      )}
                  </TypeaheadItemWrapper>}
                </div>
              )}
            </div>
          )}
        </I18nProvider>
      </ThemeContext.Provider>
    );
  }
}

CascadingSequenceProductTypeahead.propTypes = {
  success_callback: PropTypes.func,
  failure_callback: PropTypes.func,
  lang: PropTypes.string,
  browseList: PropTypes.func,
  flow: PropTypes.string,
  title: PropTypes.string
};

CascadingSequenceProductTypeahead.defaultProps = {
  success_callback: () => { },
  failure_callback: () => { },
  lang: defaultLocale,
  isTypeaheadLoading: false,
  browseList: () => { },
  flow: "productKey",
  title: "product_key_typeahead",
  dropDown: true
};
