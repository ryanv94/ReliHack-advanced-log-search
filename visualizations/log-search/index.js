import React from 'react';
import PropTypes from 'prop-types';

import {Card, CardBody, HeadingText, NrqlQuery, Spinner, AutoSizer,TextField, Button, navigation, UserStorageMutation, UserStorageQuery} from 'nr1';
import Select from 'react-select';

export default class LogSearchVisualization extends React.Component {
  // Custom props you wish to be configurable in the UI must also be defined in
  // the nr1.json file for the visualization. See docs for more details.
  static propTypes = {
    /**
     * An array of objects consisting of a nrql `query` and `accountId`.
     * This should be a standard prop for any NRQL based visualizations.
     */
    nrqlQueries: PropTypes.arrayOf(
      PropTypes.shape({
        accountId: PropTypes.number,
        query: PropTypes.string,
      })
    ),
  };

  constructor() {
    super();
    this.state = { entities: null, inputValue: "", defaultValues: []};
    this.onSelectChange = this.onSelectChange.bind(this);
    this.onTextBoxChange = this.onTextBoxChange.bind(this);
    
  }

  componentDidMount(){
    UserStorageQuery.query({
      collection: 'logSearchCustomViz',
      documentId: 'logSearchAttributes2',
    }).then(({ data }) => {
        console.info("loading previous data", data)
        if (data){
          this.onSelectChange({value: data.attributes})
          this.setState({defaultValues: data.attributes})
        }
        
    }
    ); 
  }

  saveData(attributes){
    UserStorageMutation.mutate({
      actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: 'logSearchCustomViz',
      documentId: 'logSearchAttributes2',
      document: {
        attributes: attributes,
      },
    });
  }

  //Function to open dashboard nerdpack with filter on button click. 
  buttonClick(attributes,search, accountId, openAsStacked,selectAll) {

    if (!selectAll){
      this.saveData(attributes)
    }

    const attributeSearchArr = attributes.map(attribute => {
      return `${attribute}:*${search}*`
    })

    const query = attributeSearchArr.join(' or ')

    //Dashboard nerdpack + the filters provided by the button
    const nerdlet = {
      id: 'logger.home',
      urlState: {
        "accountId":accountId,
        "$sdkVersion":3,
        "query":query,
        "eventTypes":["Log"],
        "attrs":["timestamp","span.id","message","log_summary"],
      }
    };

    //Open nerdpack as stacked or outright
    if (openAsStacked){
      navigation.openStackedNerdlet(nerdlet);
    }
    else{
      navigation.openNerdlet(nerdlet);
    }
  }

  onSelectChange(values){
    let selectedAttributes = values.value
    if (values.constructor === Array){
      selectedAttributes = values.map(value => value.value)
    }
    this.setState({selectedAttributeValues : selectedAttributes})
  }

  onTextBoxChange(event){
    this.setState({searchValue : event.target.value})
  }

  /**
   * Format the given axis tick's numeric value into a string for display.
   */
  formatTick = (value) => {
    return value.toLocaleString();
  };

  render() {
    const {nrqlQueries, openAsStacked, enableSelectAll} = this.props;

    const nrqlQueryPropsAvailable =
      nrqlQueries &&
      nrqlQueries[0] &&
      nrqlQueries[0].accountId &&
      nrqlQueries[0].query;

    if (!nrqlQueryPropsAvailable) {
      return <EmptyState />;
    }

    return (
      <AutoSizer>
        {({width, height}) => (
          <NrqlQuery
            query={nrqlQueries[0].query}
            accountId={parseInt(nrqlQueries[0].accountId)}
            pollInterval={NrqlQuery.AUTO_POLL_INTERVAL}
          >
            {({data, loading, error}) => {
              if (loading) {
                return <Spinner />;
              }

              if (error) {
                return <ErrorState />;
              }

              const accountId = nrqlQueries[0].accountId

              const stringKeys = data[0].data[0].stringKeys 

              const attributeOptions = stringKeys.map(attribute => {
                return {value: attribute, label: attribute}
              })

              const defaultValues = this.state.defaultValues.map(attribute => {
                return {value: attribute, label: attribute}
              })

              const SearchAllButton = () => {
                if (enableSelectAll){
                  return <Button onClick={() => this.buttonClick(stringKeys,this.state.searchValue, accountId, openAsStacked, true)} type={Button.TYPE.PRIMARY}>Search All Attributes</Button>
                }
                return <></>

              }



              return (
                <>
                  <TextField type={TextField.TYPE.SEARCH} placeholder="your search term" onChange={this.onTextBoxChange} />
                  <Select 
                    onChange = {this.onSelectChange}
                    onSelectResetsInput={false} 
                    isMulti 
                    defaultValue={defaultValues}
                    options={attributeOptions}
                  />
                  <Button onClick={() => this.buttonClick(this.state.selectedAttributeValues,this.state.searchValue, accountId, openAsStacked, false)} type={Button.TYPE.PRIMARY}>Search Selected Attributes</Button>
                  <SearchAllButton/>
                </>
              );
            }}
          </NrqlQuery>
        )}
      </AutoSizer>
    );
  }
}

const EmptyState = () => (
  <Card className="EmptyState">
    <CardBody className="EmptyState-cardBody">
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.SMALL]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Documentation:
      </HeadingText>
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.SMALL]}
        type={HeadingText.TYPE.HEADING_5}
      >
        Enter your Account ID, as well as the following query into the config editor on the right hand side:

      <p></p>
      <code style={{color: "blue"}}>SELECT keyset() FROM Log SINCE 1 WEEK AGO</code>
      <p></p>
      
          You can change the SINCE clause to pull in all Log events for your preferred time range

          Once your Query and Account ID are set, you should see the following options. 

          <img src="https://imgur.com/QmZt2QQ.jpg" style={{width: "80%"}}></img>
          <p></p>
          The search box should be populated with the string you are looking for across the log attributes you'll select next.
          The drop down (here with a few options already selected) allows you to pick which Log attributes you'd like to search against.

      </HeadingText>

      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.SMALL]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Video Demo:
        <p></p>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/eLVPyvzVzHk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </HeadingText> 

    </CardBody>
  </Card>
);

const ErrorState = () => (
  <Card className="ErrorState">
    <CardBody className="ErrorState-cardBody">
      <HeadingText
        className="ErrorState-headingText"
        spacingType={[HeadingText.SPACING_TYPE.LARGE]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Oops! Something went wrong. Double check your configuration. 
        <p></p>
        Make sure that you have a query specified, AND, an account ID selected.
      </HeadingText>
    </CardBody>
  </Card>
);
