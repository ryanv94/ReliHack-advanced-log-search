# Advanced Log Search

## Intro
The Advanced Log Search visualisation takes the pain out of searching across multple attributes in the Logs UI. 

Simply pick the attributes you'd like to search against, enter your search criteria, and :sparkles: - you'll be taken to the Logs UI with your search pre-populated in the filter bar.

## Getting started

Clone the Visualisation Repo:

```sh
nr1 nerdpack:clone -r https://.....
```

Change directory into the newly cloned folder & run the following scripts:

```sh
cd advanced-log-search
npm install
npm start
```

Visit https://one.newrelic.com/?nerdpacks=local, open Apps => Custom Visualisations, and :sparkles:

## Using the visualisation

You must use the specified query: 

```sql
SELECT keyset() FROM Log
```
_Optional: You may include a timerange with a `since` clause_

The keyset() keyword will return all available attributes of the specified event type (Log). This allows the attribute selection to pre-populate with the list of attributes you could search across. 

Select the attributes you are interested in, and then enter your search criteria. Hit _Search selected attributes_ - and you'll be taken to the Logs UI with your search criteria pre-populated. 

Check out this video walkthrough:

![](https://www.youtube.com/watch?v=eLVPyvzVzHk)