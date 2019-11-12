<template>
    <v-expansion-panels>
        <v-expansion-panel>
        <v-expansion-panel-header  expand-icon="mdi-menu-down"><h2><b>Live result</b></h2></v-expansion-panel-header>
        <v-expansion-panel-content>
            <v-card>
                <v-form :action="this.$API+'/live'" method="post" @submit="validateForm">
                    <v-row :align="alignment" justify="center">
                        <v-col justify="center" align="center" cols="2" md="1"><label><br>Score</label> </v-col>
                        <v-col cols="6" md="2">
                            <v-text-field :label="away" id="awayScore" v-model="scoreAway"></v-text-field>
                        </v-col>
                        <v-col cols="6" md="2">
                            <v-text-field :label="home" id="homeScore" v-model="scoreHome"></v-text-field>
                        </v-col>
                        <v-col cols="2" md="1">
                            <v-text-field label="Period" id="period" v-model="period"></v-text-field>
                        </v-col>
                        <v-col cols="2" md="1">
                            <v-text-field label="Minutes" id="period" v-model="time[0]"></v-text-field>
                        </v-col>
                        <v-col cols="2" md="1">
                            <v-text-field label="Second" id="period" v-model="time[1]"></v-text-field>
                        </v-col>
                        <v-col cols="1" md="1">
                            <v-btn @click="requestLiveAnalysis">Foo</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card>
            <v-card v-if="loading">Requesting analysis between {{away}} vs {{home}}</v-card>
        </v-expansion-panel-content>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script>
import axios from 'axios'

export default {
    name: "LiveResult",
    props: {
        home: String,
        away: String
    },
    data () {
        return {
            loading: false,
            period: null,
            time: [null, null],
            scoreHome: null,
            scoreAway: null,
            alignment: 'center',
            justify: 'center',
            clicked: 0,
        }
    },
    methods: {
        validateForm: function (e) {
            this.loading = true;
            e.preventDefault();
        },
        requestLiveAnalysis: function() {
            this.clicked++;
            let payload = {
                home: this.home,
                away: this.away,
                scoreHome: this.scoreHome,
                scoreAway: this.scoreAway,
                period: this.period,
                time: {
                    minutes: this.time[0],
                    seconds: this.time[1]
                }
            };
            console.log(`Posting payload: ${payload}`);
            axios.post(`${this.$API}/live`, payload).then(res => {
                // TODO: The server will (can) return some hefty data here, if the game is early.
                // this data needs to be displayed.
            });
            console.log(`Button clicked ${this.clicked} times. Values of form: ${this.home}: ${this.scoreHome} - ${this.away}: ${this.scoreAway}. Period: ${this.period} - Time: ${this.time[0]}:${this.time[1]}`);
        }
    }
}
</script>

<style scoped>

</style>