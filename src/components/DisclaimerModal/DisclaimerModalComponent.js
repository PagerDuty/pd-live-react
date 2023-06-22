/* eslint-disable max-len */
import {
  useState,
} from 'react';
import {
  connect,
} from 'react-redux';

// import {
//   Modal,
//   Form,
//   Button,
// } from 'react-bootstrap';

import {
  Button,
  Checkbox,
  // Form,
  Heading,
  InputGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  // ModalCloseButton,
} from '@chakra-ui/react';

import {
  useTranslation,
} from 'react-i18next';

import {
  userAcceptDisclaimer as userAcceptDisclaimerConnected,
  userUnauthorize as userUnauthorizeConnected,
} from 'redux/users/actions';

const DisclaimerModalComponent = ({
  users, userAcceptDisclaimer, userUnauthorize,
}) => {
  const {
    t,
  } = useTranslation();
  const {
    userAcceptedDisclaimer,
  } = users;
  const [acceptDisclaimer, setAcceptDisclaimer] = useState(userAcceptedDisclaimer);

  return (
    <Modal size="l" isOpen={!userAcceptedDisclaimer} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading as="h1" size="2xl" className="modal-title">
            {t('Disclaimer & License')}
          </Heading>
        </ModalHeader>
        <ModalBody>
          <p>Last updated: November 08, 2021</p>
          <h1>Interpretation and Definitions</h1>

          <h2>Interpretation</h2>
          <p>
            The words of which the initial letter is capitalized have meanings defined under the
            following conditions. The following definitions shall have the same meaning regardless
            of whether they appear in singular or in plural.
          </p>

          <h2>Definitions</h2>
          <p>For the purposes of this Disclaimer:</p>
          <ul>
            <li>
              <p>
                <strong>Company</strong>
                {' '}
                (referred to as either &quot;the Company&quot;,
                &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Disclaimer) refers to
                pd-react-live.
              </p>
            </li>
            <li>
              <p>
                <strong>Service</strong>
                {' '}
                refers to the Application.
              </p>
            </li>
            <li>
              <p>
                <strong>You</strong>
                {' '}
                means the individual accessing the Service, or the company, or
                other legal entity on behalf of which such individual is accessing or using the
                Service, as applicable.
              </p>
            </li>
            <li>
              <p>
                <strong>Application</strong>
                {' '}
                means the software program provided by the Company
                downloaded by You on any electronic device named pd-react-live.
              </p>
            </li>
          </ul>

          <h1>Disclaimer</h1>
          <p>The information contained on the Service is for general information purposes only.</p>
          <p>
            The Company assumes no responsibility for errors or omissions in the contents of the
            Service.
          </p>
          <p>
            In no event shall the Company be liable for any special, direct, indirect,
            consequential, or incidental damages or any damages whatsoever, whether in an action of
            contract, negligence or other tort, arising out of or in connection with the use of the
            Service or the contents of the Service. The Company reserves the right to make
            additions, deletions, or modifications to the contents on the Service at any time
            without prior notice. This Disclaimer has been created with the help of the
            {' '}
            <a
              href="https://www.termsfeed.com/disclaimer-generator/"
              target="_blank"
              rel="noreferrer"
            >
              Disclaimer Generator
            </a>
            .
          </p>
          <p>
            The Company does not warrant that the Service is free of viruses or other harmful
            components.
          </p>

          <h1>External Links Disclaimer</h1>
          <p>
            The Service may contain links to external websites that are not provided or maintained
            by or in any way affiliated with the Company.
          </p>
          <p>
            Please note that the Company does not guarantee the accuracy, relevance, timeliness, or
            completeness of any information on these external websites.
          </p>

          <h1>Errors and Omissions Disclaimer</h1>
          <p>
            The information given by the Service is for general guidance on matters of interest
            only. Even if the Company takes every precaution to insure that the content of the
            Service is both current and accurate, errors can occur. Plus, given the changing nature
            of laws, rules and regulations, there may be delays, omissions or inaccuracies in the
            information contained on the Service.
          </p>
          <p>
            The Company is not responsible for any errors or omissions, or for the results obtained
            from the use of this information.
          </p>

          <h1>Fair Use Disclaimer</h1>
          <p>
            The Company may use copyrighted material which has not always been specifically
            authorized by the copyright owner. The Company is making such material available for
            criticism, comment, news reporting, teaching, scholarship, or research.
          </p>
          <p>
            The Company believes this constitutes a &quot;fair use&quot; of any such copyrighted
            material as provided for in section 107 of the United States Copyright law.
          </p>
          <p>
            If You wish to use copyrighted material from the Service for your own purposes that go
            beyond fair use, You must obtain permission from the copyright owner.
          </p>

          <h1>Views Expressed Disclaimer</h1>
          <p>
            The Service may contain views and opinions which are those of the authors and do not
            necessarily reflect the official policy or position of any other author, agency,
            organization, employer or company, including the Company.
          </p>
          <p>
            Comments published by users are their sole responsibility and the users will take full
            responsibility, liability and blame for any libel or litigation that results from
            something written in or as a direct result of something written in a comment. The
            Company is not liable for any comment published by users and reserves the right to
            delete any comment for any reason whatsoever.
          </p>

          <h1>No Responsibility Disclaimer</h1>
          <p>
            The information on the Service is provided with the understanding that the Company is
            not herein engaged in rendering legal, accounting, tax, or other professional advice and
            services. As such, it should not be used as a substitute for consultation with
            professional accounting, tax, legal or other competent advisers.
          </p>
          <p>
            In no event shall the Company or its suppliers be liable for any special, incidental,
            indirect, or consequential damages whatsoever arising out of or in connection with your
            access or use or inability to access or use the Service.
          </p>

          <h1>&quot;Use at Your Own Risk&quot; Disclaimer</h1>
          <p>
            All information in the Service is provided &quot;as is&quot;, with no guarantee of
            completeness, accuracy, timeliness or of the results obtained from the use of this
            information, and without warranty of any kind, express or implied, including, but not
            limited to warranties of performance, merchantability and fitness for a particular
            purpose.
          </p>
          <p>
            The Company will not be liable to You or anyone else for any decision made or action
            taken in reliance on the information given by the Service or for any consequential,
            special or similar damages, even if advised of the possibility of such damages.
          </p>

          <h1>License</h1>
          <p>MIT License</p>

          <p>Copyright (c) 2021 Giran Moodley</p>

          <p>
            Permission is hereby granted, free of charge, to any person obtaining a copy of this
            software and associated documentation files (the &quot;Software&quot;), to deal in the
            Software without restriction, including without limitation the rights to use, copy,
            modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
            to permit persons to whom the Software is furnished to do so, subject to the following
            conditions:
          </p>
          <p>
            The above copyright notice and this permission notice shall be included in all copies or
            substantial portions of the Software.
          </p>
          <p>
            THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
            PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
            HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
            CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
            THE USE OR OTHER DEALINGS IN THE SOFTWARE.
          </p>

          <h1>Contact Us</h1>
          <p>If you have any questions about this Disclaimer & License, You can contact Us:</p>
          <ul>
            <li>
              By visiting this page on our website:
              {' '}
              <a
                href="https://github.com/pagerduty/pd-live-react"
                rel="external nofollow noopener noreferrer"
                target="_blank"
              >
                https://github.com/pagerduty/pd-live-react
              </a>
            </li>
          </ul>
        </ModalBody>
        <ModalFooter>
          <InputGroup>
            <Checkbox
              id="disclaimer-agree-checkbox"
              required
              onChange={(e) => setAcceptDisclaimer(e.target.checked)}
            >
              {t('I agree to the disclaimer and license above')}
            </Checkbox>
          </InputGroup>
          <Button
            id="disclaimer-accept-button"
            mr={4}
            colorScheme="green"
            onClick={() => userAcceptDisclaimer()}
            isDisabled={!acceptDisclaimer}
          >
            {t('Accept')}
          </Button>
          <Button
            colorScheme="red"
            onClick={() => {
              userUnauthorize();
              sessionStorage.removeItem('pd_access_token');
              window.location.reload();
            }}
          >
            {t('Decline')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const mapStateToProps = (state) => ({
  users: state.users,
});

const mapDispatchToProps = (dispatch) => ({
  userAcceptDisclaimer: () => dispatch(userAcceptDisclaimerConnected()),
  userUnauthorize: () => dispatch(userUnauthorizeConnected()),
});

export default connect(mapStateToProps, mapDispatchToProps)(DisclaimerModalComponent);
