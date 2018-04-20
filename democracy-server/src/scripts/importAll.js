import _ from 'lodash';

import createClient from '../graphql/client';
import Procedure from '../models/Procedure';
import getAllProcedures from '../graphql/queries/getAllProcedures';

const deputiesNumber = {
  8: 518,
  9: 519,
  10: 520,
  11: 663,
  12: 662,
  13: 672,
  14: 665,
  15: 601,
  16: 611,
  17: 620,
  18: 630,
  19: 709,
};

const pastStatus = ['Zurückgezogen', 'Abgelehnt', 'Angenommen'];

export default async (req, res) => {
  const client = createClient();
  console.log('Start Importing');
  const { data: { allProcedures } } = await client.query({
    query: getAllProcedures,
    // variables: {},
  });
  console.log(allProcedures.map(({ procedureId }) => procedureId));
  console.log('Start Inserting');
  // Start Inserting
  await allProcedures.forEach(async (bIoProcedure) => {
    const newBIoProcedure = { ...bIoProcedure };
    if (bIoProcedure && bIoProcedure.history) {
      const [lastHistory] = newBIoProcedure.history.slice(-1);
      const btWithDecisions = bIoProcedure.history.filter(({ assignment, initiator }) => assignment === 'BT' && initiator === '2. Beratung');
      if (btWithDecisions.length > 0) {
        newBIoProcedure.voteDate = new Date(btWithDecisions.pop().date);
      } else if (pastStatus.some(status => status === newBIoProcedure.currentStatus)) {
        newBIoProcedure.voteDate = lastHistory.date;
      }
      let voteResults;
      bIoProcedure.history.some((h) => {
        if (h.decision) {
          return h.decision.some((decision) => {
            if (decision.type === 'Namentliche Abstimmung') {
              const voteResultsRegEx = /(\d{1,3}:\d{1,3}:\d{1,3})/;
              const vResults = decision.comment.match(voteResultsRegEx)[0].split(':');
              voteResults = {
                yes: vResults[0],
                no: vResults[1],
                abstination: vResults[2],
                notVote:
                  deputiesNumber[bIoProcedure.period] -
                  vResults.reduce((pv, cv) => pv + parseInt(cv, 10), 0),
              };
              return true;
            }
            return false;
          });
        }
        return false;
      });

      newBIoProcedure.voteResults = voteResults;

      newBIoProcedure.lastUpdateDate = lastHistory.date;

      newBIoProcedure.submissionDate = newBIoProcedure.history[0].date;
    }

    await Procedure.findOneAndUpdate(
      { procedureId: newBIoProcedure.procedureId },
      _(newBIoProcedure)
        .omitBy(x => _.isNull(x) || _.isUndefined(x))
        .value(),
      {
        upsert: true,
      },
    );
  });
  console.log('Imported everything!'); // eslint-disable-line
  res.send('Imported everything!');
};
